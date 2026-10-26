import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass, Volume2, VolumeX
} from "lucide-react";

import type { GameState } from "./types";
import { LEVELS } from "./types";
import { audioEngine } from "./components/AudioEngine";

import { UVKeypad } from "./components/UVKeypad";
import { AlarmLockdown } from "./components/AlarmLockdown";
import { CalendarLevel } from "./components/CalendarLevel";
import { PrimeSafe } from "./components/PrimeSafe";
import { ParallelogramCanvas } from "./components/ParallelogramCanvas";
import { MapOverlay } from "./components/MapOverlay";
import { DormClockLevel } from "./components/DormClockLevel";
import { MagicSquareLevel } from "./components/MagicSquareLevel";
import { MirrorWallLevel } from "./components/MirrorWallLevel";
import { PianoLevel } from "./components/PianoLevel";
import { LawnDiaryLevel } from "./components/LawnDiaryLevel";
import { BannerBlessingLevel } from "./components/BannerBlessingLevel";
import { FinalPerfectLock } from "./components/FinalPerfectLock";
import { GymOuterLock } from "./components/GymOuterLock";
import { LocationChoiceScreen } from "./components/LocationChoiceScreen";
import { ItemUnlockDialog } from "./components/ItemUnlockDialog";
import { ITEM_IMAGES, LEVEL_IMAGES } from "./levelAssets";
import { getLevelBgm } from "./levelBgm";
import { StarFlightOverlay, type StarPoint } from "./components/StarFlightOverlay";

const INITIAL_STATE: GameState = {
  currentLevelId: "intro",
  unlockedLevels: ["intro", "loc_gate"],
  isAlarmActive: false,
  alarmTimeLeft: 300,
  dormGateSequence: [],
  dormLoungeSolved: false,
  horcruxSolved: { dorm: false, art: false, primary: false },
  hasCookie: false,
  hasStarCard: false,
  hasDiary: false,
  hasBanner: false,
  currentDormGateInputs: [],
  completedLevels: ["intro"],
};

type ItemDialogState = {
  title: string;
  icon: string;
  description?: string;
  nextLevelId: string;
} | null;

function normalizeSavedState(parsed: Record<string, unknown>): GameState {
  const { hasPalette: _removed, ...rest } = parsed as Record<string, unknown> & { hasPalette?: boolean };
  return {
    ...INITIAL_STATE,
    ...(rest as Partial<GameState>),
    hasCookie: Boolean(rest.hasCookie),
    hasStarCard: Boolean(rest.hasStarCard),
    hasDiary: Boolean(rest.hasDiary),
    hasBanner: Boolean(rest.hasBanner),
    horcruxSolved: {
      dorm: Boolean((rest.horcruxSolved as GameState["horcruxSolved"] | undefined)?.dorm),
      art: Boolean((rest.horcruxSolved as GameState["horcruxSolved"] | undefined)?.art),
      primary: Boolean((rest.horcruxSolved as GameState["horcruxSolved"] | undefined)?.primary),
    },
    unlockedLevels: Array.isArray(rest.unlockedLevels) ? (rest.unlockedLevels as string[]) : INITIAL_STATE.unlockedLevels,
    completedLevels: Array.isArray(rest.completedLevels) ? (rest.completedLevels as string[]) : INITIAL_STATE.completedLevels,
    currentLevelId: typeof rest.currentLevelId === "string" ? rest.currentLevelId : "intro",
  };
}

export default function App() {
  /** Bump version to clear stale mid-game saves when sharing the site. */
  const LOCAL_STORAGE_KEY = "消失的畢業驚喜_STATE_V2";

  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.currentLevelId === "string") {
          return normalizeSavedState(parsed);
        }
      }
    } catch (e) {
      console.warn("Storage restoration failed:", e);
    }
    return { ...INITIAL_STATE };
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  const [bgAmbient, setBgAmbient] = useState<boolean>(true);
  /** Continuous star flight: hold at `from`, then fly to `to` once MapOverlay measures targets. */
  const [starFlight, setStarFlight] = useState<{ from: StarPoint[]; to: StarPoint[] | null } | null>(null);
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [backpackTab, setBackpackTab] = useState<"items" | "progress">("items");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showAlarmFailure, setShowAlarmFailure] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navGenerationRef = useRef(0);
  const [intermissionChoiceError, setIntermissionChoiceError] = useState<string>("");
  const [intermissionSuccess, setIntermissionSuccess] = useState<string>("");
  const [itemDialog, setItemDialog] = useState<ItemDialogState>(null);
  const [finishStep, setFinishStep] = useState(1);

  const cancelPendingNavigation = () => {
    navGenerationRef.current += 1;
    if (navTimerRef.current) {
      clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
  };

  const scheduleAdvance = (nextLvId: string, delay: number) => {
    cancelPendingNavigation();
    const gen = navGenerationRef.current;
    navTimerRef.current = setTimeout(() => {
      if (gen !== navGenerationRef.current) return;
      advanceToLevel(nextLvId);
      navTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    cancelPendingNavigation();
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    if (state.currentLevelId === "finish") setFinishStep(1);
  }, [state.currentLevelId]);

  useEffect(() => {
    audioEngine.setBgmEnabled(bgAmbient);
    if (!bgAmbient) {
      audioEngine.stopBgm();
      return;
    }

    const cfg = getLevelBgm(state.currentLevelId);
    const startBgm = () => {
      void audioEngine.unlockAudio().then(() => {
        void audioEngine.playLevelBgm(cfg);
      });
    };

    startBgm();

    const onInteract = () => startBgm();
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('touchstart', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      audioEngine.stopBgm();
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [state.currentLevelId, bgAmbient]);

  useEffect(() => {
    if (state.currentLevelId !== "finish") {
      setConfettiActive(false);
      return;
    }

    setConfettiActive(true);
    const stopTimer = setTimeout(() => setConfettiActive(false), 5000);
    return () => clearTimeout(stopTimer);
  }, [state.currentLevelId]);

  useEffect(() => {
    if (!confettiActive || state.currentLevelId !== "finish") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotationSpeed: number;
    }> = [];
    const colors = ["#e0f2fe", "#38bdf8", "#0ea5e9", "#f59e0b", "#10b981", "#fb7185", "#c084fc"];

    for (let i = 0; i < 180; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 8 + 3,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
      });
    }

    let animationFrameId: number;
    const run = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      animationFrameId = requestAnimationFrame(run);
    };
    run();

    return () => cancelAnimationFrame(animationFrameId);
  }, [confettiActive, state.currentLevelId]);

  const triggerReset = () => {
    audioEngine.playBeep(300, 0.2);
    cancelPendingNavigation();
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({ ...INITIAL_STATE });
    setConfettiActive(false);
    setShowResetConfirm(false);
    setItemDialog(null);
    setFinishStep(1);
  };

  const handleResetGame = () => {
    setShowResetConfirm(true);
    audioEngine.playBeep(605, 0.1);
  };

  const advanceToLevel = (nextLvId: string) => {
    audioEngine.playBeep(880, 0.1);
    const currentIdx = LEVELS.findIndex((l) => l.id === state.currentLevelId);
    let newlyCompleted = [...state.completedLevels];
    if (currentIdx !== -1) {
      newlyCompleted = Array.from(new Set([...newlyCompleted, state.currentLevelId]));
    }
    const nextIdx = LEVELS.findIndex((l) => l.id === nextLvId);
    let newlyUnlocked = [...state.unlockedLevels];
    if (nextIdx !== -1) {
      newlyUnlocked = Array.from(new Set([...newlyUnlocked, nextLvId]));
    }
    setState((prev) => ({
      ...prev,
      currentLevelId: nextLvId,
      unlockedLevels: newlyUnlocked,
      completedLevels: newlyCompleted,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMapNodeJump = (lvId: string) => {
    if (state.unlockedLevels.includes(lvId)) {
      audioEngine.playBeep(600, 0.08);
      setState((prev) => ({ ...prev, currentLevelId: lvId }));
    }
  };

  const handleLevelGateSuccess = () => advanceToLevel("loc_alarm");
  const handleLockdownSuccess = () => advanceToLevel("loc_office_door");

  const handleAlarmFailure = () => {
    setShowAlarmFailure(true);
  };

  const confirmAlarmFailure = () => {
    setShowAlarmFailure(false);
    audioEngine.playBeep(400, 0.1);
    setState((prev) => ({ ...prev, currentLevelId: "loc_gate" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIntermission1Select = (choice: string) => {
    audioEngine.playBeep(500, 0.1);
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    if (choice === "宿舍") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 聰明的選擇。請立刻前往宿舍，跑起來吧！");
      scheduleAdvance("loc_dorm_gate", 1200);
    } else {
      setIntermissionChoiceError("❌ 「嗶！別想隨便亂闖，完美的遊戲必須按部就班。請重新解讀詩裡的線索！」");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleLoungeSuccess = () => {
    setState((prev) => ({
      ...prev,
      hasCookie: true,
      horcruxSolved: { ...prev.horcruxSolved, dorm: true },
    }));
    setItemDialog({
      title: "解鎖成功！獲得一塊溫熱的餅乾",
      icon: "🍪",
      description: "已自動存入探險背包。",
      nextLevelId: "loc_intermission2",
    });
  };

  const handleIntermission2Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.1);
    if (choice === "藝文館") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 算你們有點眼光。帶著那半張殘破的星夜，前往藝文館一樓吧！");
      scheduleAdvance("loc_art_mirror", 2000);
    } else {
      setIntermissionChoiceError("❌ 「難道那塊餅乾堵住了你們的觀察力？請看清楚手上的線索，再選一次！」");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleMirrorSuccess = () => {
    setState((prev) => ({
      ...prev,
      hasStarCard: true,
    }));
    setItemDialog({
      title: "解鎖成功！獲得梵谷星夜明信片",
      icon: "🌌",
      description: "已自動存入探險背包。",
      nextLevelId: "loc_art_piano",
    });
  };

  const handlePianoSuccess = () => {
    setState((prev) => ({
      ...prev,
      horcruxSolved: { ...prev.horcruxSolved, art: true },
    }));
    advanceToLevel("loc_intermission3");
  };

  const handleIntermission3Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.08);
    if (choice === "小學樓") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 解鎖成功！溜滑梯的邊角隱藏著最後的秘密，去那裡，集齊屬於你們的畢業記憶。");
      scheduleAdvance("loc_primary_grass", 1200);
    } else {
      setIntermissionChoiceError("❌ 「體育館雖然有純真，卻也已經摻雜了不少青春期的衝撞。去尋找那個一切從零開始、專屬於稚嫩童音的堡壘吧。」");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleIntermission4Select = (choice: string) => {
    setIntermissionChoiceError("");
    setIntermissionSuccess("");
    audioEngine.playBeep(500, 0.08);
    if (choice === "體育館") {
      audioEngine.playBeep(880, 0.2);
      setIntermissionSuccess("✅ 解鎖成功！來體育館找我吧，找回屬於你們的驚喜。");
      scheduleAdvance("loc_gym_outer", 1200);
    } else {
      setIntermissionChoiceError("航線已鎖定終點，請前往體育館。");
      audioEngine.playBeep(180, 0.3);
    }
  };

  const handleLawnDiarySuccess = () => {
    setState((prev) => ({
      ...prev,
      hasDiary: true,
      horcruxSolved: { ...prev.horcruxSolved, primary: true },
    }));
    setItemDialog({
      title: "解鎖成功！獲得日記本",
      icon: "📖",
      description: "已自動存入探險背包。",
      nextLevelId: "loc_explore_center",
    });
  };

  const handleBannerSuccess = () => {
    setState((prev) => ({
      ...prev,
      hasBanner: true,
    }));
    setItemDialog({
      title: "解鎖成功！獲得菁英活動布旗",
      icon: "🛡️",
      description: "已自動存入探險背包。",
      nextLevelId: "loc_intermission4",
    });
  };

  const confirmItemDialog = () => {
    if (!itemDialog) return;
    const next = itemDialog.nextLevelId;
    setItemDialog(null);
    advanceToLevel(next);
  };

  const backpackItems = [
    {
      key: "cookie",
      icon: "🍪",
      image: ITEM_IMAGES.cookie,
      spirit: "精神",
      name: "溫熱的餅乾",
      desc: "一塊飄著溫熱香甜烘焙糕底氣味的餅乾。獲得地點宿舍，象徵精神。當你感到疲憊、低潮時，別忘了吃一口，它會給你滿滿的支持與精神鼓勵。",
      unlocked: state.hasCookie,
    },
    {
      key: "star",
      icon: "🌌",
      image: ITEM_IMAGES.postcard,
      spirit: "美感",
      name: "梵谷《星夜》明信片",
      desc: "一張背面寫著特殊謎字、邊角微微磨損，被撕成一半的明信片。獲得地點藝文館，象徵美感。無論未來有多忙碌，都別忘了留給自己一雙能看見生活中微小美好的眼睛。",
      unlocked: state.hasStarCard,
    },
    {
      key: "diary",
      icon: "📖",
      image: ITEM_IMAGES.diary,
      spirit: "純真",
      name: "褪色的舊日記本",
      desc: "一本字跡歪歪扭扭、注音還會拼錯的舊日記本。獲得地點小學樓草皮，象徵純真。在未來複雜的世界裡，請時常與自己的內在對話，提醒自己始終保有那顆不被世俗污染、最澄澈純真的心。",
      unlocked: state.hasDiary,
    },
    {
      key: "banner",
      icon: "🛡️",
      image: ITEM_IMAGES.banner,
      spirit: "勇氣與力量",
      name: "菁英活動布旗",
      desc: "一面帶有特殊弧度的紫色布旗，上面貼著參加過的菁英活動布章。獲得地點探索中心，象徵勇氣與力量。真正的菁英是失敗後還敢勇敢再試一次。帶著這份力量去跨越未來的挑戰吧！",
      unlocked: state.hasBanner,
    },
  ];

  const activeLevel = LEVELS.find((l) => l.id === state.currentLevelId) || LEVELS[0];

  return (
    <div className={`bg-[#0a0a0b] text-stone-200 flex flex-col font-sans select-none relative ${state.currentLevelId === "finish" ? "min-h-screen" : "min-h-full"}`}>
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-950/5 blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-stone-950/10 blur-[150px] pointer-events-none -z-10" />

      {confettiActive && (
        <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-50 bg-transparent" />
      )}

      {starFlight && (
        <StarFlightOverlay
          from={starFlight.from}
          to={starFlight.to}
          onComplete={() => setStarFlight(null)}
          duration={2.4}
        />
      )}

      <header className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-xl border-b border-stone-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-xl shadow-md">🕵️‍♂️</div>
          <div className="min-w-0">
            <h1 className="text-lg font-serif italic text-amber-500 truncate">消失的畢業驚喜</h1>
          </div>
        </div>
        <div className="text-md text-[12px] md:text-[16px] leading-snug text-stone-500 shrink-0 max-w-[5.5rem] md:max-w-none">
          <p>林口康橋 數學科</p>
          <p>許芷雲教師設計</p>
          <p>郭育誠教師數位技術</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => { setBackpackTab("items"); setMapOpen(true); audioEngine.playBeep(600, 0.1); }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-700 hover:bg-amber-600 font-bold text-xs text-white rounded-lg transition-all shadow-md active:scale-95 leading-none border border-amber-600/20"
            title="查看探險背包與探索地圖"
          >
            <span className="text-sm">🎒</span>
            <span className="hidden sm:inline">探險背包</span>
            <span className="sm:hidden">背包</span>
          </button>
          <button
            onClick={() => {
              const next = !bgAmbient;
              if (!next) {
                audioEngine.setBgmEnabled(false);
              } else {
                audioEngine.setBgmEnabled(true);
                void audioEngine.unlockAudio().then(() => {
                  void audioEngine.playLevelBgm(getLevelBgm(state.currentLevelId));
                });
              }
              setBgAmbient(next);
              audioEngine.playBeep(next ? 800 : 300, 0.1);
            }}
            className={`p-2 rounded text-stone-400 hover:text-white transition-all ${bgAmbient ? "bg-amber-950/20 text-amber-500 border border-amber-500/20" : "bg-stone-900 border border-stone-800"}`}
            title={bgAmbient ? "關閉背景音樂" : "開啟背景音樂（依關卡切換）"}
          >
            {bgAmbient ? <Volume2 className="h-4 w-4 animate-pulse" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main className={`flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 z-10 relative flex flex-col ${state.currentLevelId === "finish" ? "pb-4 min-h-[calc(100dvh-4.5rem)]" : "pb-24"}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentLevelId}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className={`bg-[#121214] border border-stone-800 p-6 md:p-8 rounded-2xl shadow-2xl relative backdrop-blur-md ${state.currentLevelId === "finish" ? "flex-1 flex flex-col justify-center min-h-0" : ""}`}
          >
            {state.currentLevelId === "intro" && (
              <div className="space-y-6 text-center py-6">
                <h2 className="text-3xl font-serif italic text-amber-500 tracking-widest uppercase">📜 故事前言</h2>
                <div className="max-w-lg mx-auto text-stone-300 space-y-4 text-base leading-loose font-medium text-left bg-stone-900 border border-stone-800 p-6 rounded-2xl">
                  <p>那天在走廊經過，無意間聽到導師們神色慌張地討論著：放在導師辦公室準備給班上的『畢業驚喜』竟然不見了！</p>
                  <p>雖然會考已經結束，但這份屬於全班的紀念絕對不能就這樣消失。你決定在假日偷偷潛回校園，循著微弱的線索，領回屬於自己的畢業禮物。</p>
                </div>
                <div className="pt-4">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => advanceToLevel("loc_gate")}
                    className="px-10 py-4 bg-amber-700 hover:bg-amber-600 font-bold tracking-widest text-white text-base rounded shadow-xl transition-colors shadow-amber-950/20">
                    開始潛入調查
                  </motion.button>
                </div>
              </div>
            )}

            {state.currentLevelId === "loc_gate" && <UVKeypad onSuccess={handleLevelGateSuccess} />}
            {state.currentLevelId === "loc_alarm" && (
              <AlarmLockdown onSuccess={handleLockdownSuccess} onFailure={handleAlarmFailure} />
            )}
            {state.currentLevelId === "loc_office_door" && <CalendarLevel onSuccess={() => advanceToLevel("loc_safe")} />}
            {state.currentLevelId === "loc_safe" && <PrimeSafe onSuccess={() => advanceToLevel("loc_tablet")} />}
            {state.currentLevelId === "loc_tablet" && (
              <ParallelogramCanvas
                onSuccess={(points) => {
                  if (points && points.length >= 6) {
                    setStarFlight({ from: points, to: null });
                  }
                  advanceToLevel("loc_star_map");
                }}
              />
            )}
            {state.currentLevelId === "loc_star_map" && (
              <MapOverlay
                starFlightActive={!!starFlight}
                onStarTargetsReady={(targets) => {
                  setStarFlight((prev) => (prev ? { ...prev, to: targets } : null));
                }}
                onSuccess={() => advanceToLevel("loc_intermission1")}
              />
            )}

            {state.currentLevelId === "loc_intermission1" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice8}
                activeSlots={["gym", "primary", "art", "dorm"]}
                onSelect={handleIntermission1Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_dorm_gate" && <DormClockLevel onSuccess={() => advanceToLevel("loc_dorm_lounge")} />}
            {state.currentLevelId === "loc_dorm_lounge" && <MagicSquareLevel onSuccess={handleLoungeSuccess} />}

            {state.currentLevelId === "loc_intermission2" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice11}
                activeSlots={["gym", "primary", "art"]}
                onSelect={handleIntermission2Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_art_mirror" && <MirrorWallLevel onSuccess={handleMirrorSuccess} />}
            {state.currentLevelId === "loc_art_piano" && <PianoLevel onSuccess={handlePianoSuccess} />}

            {state.currentLevelId === "loc_intermission3" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice14}
                activeSlots={["gym", "primary"]}
                onSelect={handleIntermission3Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_primary_grass" && <LawnDiaryLevel onSuccess={handleLawnDiarySuccess} />}
            {state.currentLevelId === "loc_explore_center" && <BannerBlessingLevel onSuccess={handleBannerSuccess} />}

            {state.currentLevelId === "loc_intermission4" && (
              <LocationChoiceScreen
                imageSrc={LEVEL_IMAGES.locationChoice17}
                activeSlots={["gym"]}
                onSelect={handleIntermission4Select}
                error={intermissionChoiceError}
                success={intermissionSuccess}
              />
            )}

            {state.currentLevelId === "loc_gym_outer" && <GymOuterLock onSuccess={() => advanceToLevel("loc_gym_inner")} />}
            {state.currentLevelId === "loc_gym_inner" && <FinalPerfectLock onSuccess={() => advanceToLevel("finish")} />}

            {state.currentLevelId === "finish" && (
              <div className="space-y-6 text-center py-6 md:py-10 flex-1 flex flex-col justify-center w-full">
                <AnimatePresence mode="wait">
                  {finishStep === 1 && (
                    <motion.div key="f1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
                      <span className="text-6xl animate-bounce block">🎓</span>
                      <h2 className="text-3xl md:text-4xl font-serif italic text-amber-500 font-bold tracking-widest">解鎖成功，畢業快樂</h2>
                      <button
                        type="button"
                        onClick={() => { setFinishStep(2); audioEngine.playBeep(700, 0.12); }}
                        className="px-10 py-3.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg text-base"
                      >
                        嫌犯揭曉
                      </button>
                    </motion.div>
                  )}
                  {finishStep === 2 && (
                    <motion.div key="f2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
                      <div className="max-w-2xl mx-auto bg-stone-950/80 p-6 md:p-8 rounded-2xl border border-stone-800 text-left space-y-4 shadow-2xl text-stone-300 leading-relaxed text-base">
                        <img
                          src={LEVEL_IMAGES.teachersSilhouette}
                          alt="從體育館走出的黑黑人影"
                          className="w-full rounded-xl border border-stone-800 object-cover max-h-64"
                        />
                        <p>體育館遠處的暗門緩緩打開，五個黑黑的人影從遠處頂光走來。</p>
                        <p className="font-bold text-amber-400">沒有看錯！那五個身影逐漸清晰，嫌犯正是九年級的五位數學老師們！</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFinishStep(3); audioEngine.playBeep(700, 0.12); }}
                        className="px-10 py-3.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg text-base"
                      >
                        領取畢業驚喜
                      </button>
                    </motion.div>
                  )}
                  {finishStep === 3 && (
                    <motion.div key="f3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                      <div className="max-w-2xl mx-auto bg-stone-950/80 p-6 md:p-8 rounded-2xl border border-stone-800 text-left space-y-4 shadow-2xl text-stone-300 leading-relaxed text-base">
                        <p className="font-bold text-amber-500">「沒錯，這場天羅地網的謎題，就是我們送給你們的畢業禮物。」</p>
                        <p>雖然會考已經結束，但我們在旁看著你們解謎，其實是想在最後帶領你們重新走過這三年的足跡，檢視你們在康橋國中三年，用汗水與挑戰換來的四份重要精神：</p>
                        <ul className="text-sm space-y-3 text-stone-400">
                          <li className="flex gap-2"><span className="text-lg shrink-0" aria-hidden>🍪</span><span>到了【宿舍】解開鎖頭，代表你們找到了『精神』，那代表面對未來挑戰時，能夠平靜面對與自我修復的能力；</span></li>
                          <li className="flex gap-2"><span className="text-lg shrink-0" aria-hidden>🌌</span><span>到了【藝文館】透過鏡像看清旋律，代表你們找到了『美感』，那代表生命中不可或缺的藝術與創造力；</span></li>
                          <li className="flex gap-2"><span className="text-lg shrink-0" aria-hidden>📖</span><span>到了【小學樓】在草皮上追尋日記，代表你們找到了『純真』，那是無論長多大、走得多遠，都絕對不能忘記的初心與無邪；</span></li>
                          <li className="flex gap-2"><span className="text-lg shrink-0" aria-hidden>🛡️</span><span>最後，到了【探索中心】，找到布旗中的線索，代表你們找到了『勇氣』與『力量』，那是你們這三年不斷蛻變、超越自我的體能證明！</span></li>
                        </ul>
                        <p className="text-stone-400 text-sm italic">畢業驚喜從來沒有消失，它早就刻在你們這三年的成長足跡裡。願你們帶著這四份精神，繼續在高中揮灑青春，勇敢圓夢！</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setFinishStep(4); setConfettiActive(true); audioEngine.playBeep(880, 0.2); }}
                        className="px-8 py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg"
                      >
                        恭喜畢業
                      </button>
                    </motion.div>
                  )}
                  {finishStep === 4 && (
                    <motion.div key="f4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-6">
                      <div className="max-w-2xl mx-auto bg-stone-950/80 p-6 md:p-8 rounded-2xl border border-stone-800 text-left space-y-4 shadow-2xl text-stone-300 leading-relaxed text-base">
                        <p className="text-amber-400/90 text-sm">
                          🎁 彩蛋：不過，既然是解謎，我們還是很講究速度的！現在，第一名解開最後一關『0628完美數』、並向數學老師出示平板成功截圖畫面的人……可以領取全場最特別、最獨一無二的『神祕驚喜禮物』一份！
                        </p>
                      </div>
                      <button onClick={handleResetGame} className="px-6 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-stone-400 hover:text-stone-200 transition font-bold rounded">
                        🔄 重置遊戲
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {state.currentLevelId !== "intro" && state.currentLevelId !== "finish" && (
              <div className="mt-8 pt-5 border-t border-stone-800 flex items-center text-xs font-mono">
                <span className="flex items-center gap-1 text-stone-400">
                  <Compass className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                  當前位置：{activeLevel.locationName}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {state.currentLevelId !== "intro" && state.currentLevelId !== "finish" && (
          <div className="flex justify-center mt-6 z-0 relative">
            <button onClick={handleResetGame} className="px-4 py-2 border border-stone-800 rounded hover:bg-red-950/20 hover:border-red-500/20 font-bold font-mono text-[11px] text-stone-500 hover:text-red-400 transition">
              🔄 完全清除緩存重置遊戲
            </button>
          </div>
        )}
      </main>

      <ItemUnlockDialog
        open={!!itemDialog}
        title={itemDialog?.title ?? ""}
        description={itemDialog?.description}
        icon={itemDialog?.icon}
        onConfirm={confirmItemDialog}
      />

      <AnimatePresence>
        {showAlarmFailure && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1c1917] border border-red-900/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
              <div className="w-14 h-14 bg-red-950/50 border border-red-700/50 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl animate-pulse">🚨</div>
              <div className="space-y-2">
                <h3 className="text-red-300 font-bold text-lg font-serif italic tracking-wide">潛入行動暴露！</h3>
                <p className="text-sm text-stone-300 leading-relaxed">
                  警衛室的全域封鎖程序已啟動，保全手電筒的光束掃過走廊——<span className="text-red-400 font-semibold">你被發現了</span>。
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  這次的調查以失敗收場。你只能退回校門，重新規劃潛入路線，再次挑戰警報中斷程序。
                </p>
              </div>
              <button type="button" onClick={confirmAlarmFailure}
                className="w-full py-3 bg-red-800 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-900/30">
                退回校門，重新潛入
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="bg-[#1c1917] border border-stone-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-red-950/40 border border-red-900/40 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl animate-pulse">⚠️</div>
              <div className="space-y-1">
                <h3 className="text-stone-100 font-bold text-base">重置探索旅程嗎？</h3>
                <p className="text-xs text-stone-400 leading-relaxed">這會清空你在本校園的所有解鎖進度（包含道具、日記、解鎖狀態），回到最初校外走廊。</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => { setShowResetConfirm(false); audioEngine.playBeep(400, 0.08); }}
                  className="py-2.5 bg-stone-900 border border-stone-800 text-stone-400 rounded-xl text-xs font-bold transition-all active:scale-95">取消返回</button>
                <button type="button" onClick={triggerReset} className="py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-900/30">確認清除重置</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mapOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 text-[#e7e5e4]">
            <motion.div initial={{ scale: 0.9, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 15 }}
              className="bg-[#121214] border border-stone-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto scrollbar-detective shadow-2xl relative flex flex-col">
              <div className="flex justify-between items-start border-b border-stone-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <h3 className="text-xl font-bold text-stone-100 font-serif italic tracking-wide">探險背包 ─ 探索地圖</h3>
                </div>
                <button type="button" onClick={() => { setMapOpen(false); audioEngine.playBeep(500, 0.08); }}
                  className="px-3 py-1 bg-stone-900 border border-stone-800 text-stone-400 hover:text-white rounded-lg text-xs font-mono font-bold hover:bg-stone-800 transition-colors">關閉返回</button>
              </div>

              <div className="flex gap-2 mb-6 border-b border-stone-800 pb-2 shrink-0">
                {(["items", "progress"] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => { setBackpackTab(tab); audioEngine.playBeep(600, 0.08); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border ${
                      backpackTab === tab ? "bg-amber-950/10 text-amber-500 border-amber-500/20 shadow-inner" : "bg-stone-900/40 text-stone-400 border-transparent hover:text-stone-200"
                    }`}>
                    <span>{tab === "items" ? "🎒 探險背包" : "🗺 探索地圖"}</span>
                  </button>
                ))}
              </div>

              {backpackTab === "items" && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed mb-4">💡 這裡存放著你從校園各個角落解鎖、尋得的核心道具。</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {backpackItems.map((item) => (
                      item.unlocked ? (
                        <div key={item.key} className="p-4 rounded-xl border border-stone-800 bg-stone-900/50 flex gap-4 items-start shadow-md">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-stone-800 bg-stone-950 shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] text-amber-600/90 font-mono">{item.icon} 象徵：{item.spirit}</p>
                            <h4 className="text-sm font-bold font-serif italic text-amber-500">{item.name}</h4>
                            <p className="text-[11px] leading-relaxed text-stone-400">{item.desc}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={item.key}
                          className="p-4 rounded-xl border border-stone-900 bg-black min-h-[96px] flex items-center justify-center shadow-inner"
                          aria-label="尚未解鎖的道具"
                        >
                          <span className="text-3xl opacity-80">🔒</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {backpackTab === "progress" && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400 leading-relaxed mb-4 bg-amber-950/10 p-2.5 border border-amber-500/15 rounded-xl">
                    💡 當你破關或需要重溫時，隨時點擊下方已解鎖的關卡，即可快速『回頭體驗』先前的解謎情境，或是尋找遺漏的線索！
                  </p>
                  <div className="space-y-2 max-h-[45vh] overflow-y-auto scrollbar-detective pr-2">
                    {LEVELS.map((node) => {
                      const isUnlocked = state.unlockedLevels.includes(node.id);
                      const isCurrent = state.currentLevelId === node.id;
                      const isCompleted = state.completedLevels.includes(node.id) || node.id === "intro";
                      if (!isUnlocked) {
                        return (
                          <div
                            key={node.id}
                            className="p-3.5 rounded-xl border border-stone-950 bg-black min-h-[64px] flex items-center justify-center cursor-not-allowed"
                            aria-label="尚未解鎖的關卡"
                          >
                            <span className="text-xl opacity-80">🔒</span>
                          </div>
                        );
                      }
                      return (
                        <div key={node.id} onClick={() => { handleMapNodeJump(node.id); setMapOpen(false); }}
                          className={`p-3.5 rounded-xl border transition-all text-left relative flex items-start gap-4 ${
                            isCurrent ? "bg-amber-950/20 border-amber-600/40 shadow-lg cursor-default"
                            : "bg-stone-900/60 hover:bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700 cursor-pointer"
                          }`}>
                          <div className="mt-0.5 shrink-0">
                            {isCurrent ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-stone-950 font-bold animate-pulse">🕵️‍♂️</span>
                              : isCompleted ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950/70 border border-emerald-500/50 text-[10px] text-emerald-400 font-bold">✓</span>
                              : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-[10px] text-amber-500 font-mono">•</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase ${isCurrent ? "text-amber-400" : "text-stone-400"}`}>📍 {node.locationName}</span>
                              {isCurrent && <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold animate-pulse">探索中</span>}
                            </div>
                            <h4 className={`text-sm mt-0.5 ${isCurrent ? "text-stone-100 font-bold" : "text-stone-300"}`}>{node.title}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between items-center text-xs text-stone-500 shrink-0">
                <span>已解鎖校園地點：{state.unlockedLevels.length} / {LEVELS.length} 關卡</span>
                <span>系統已自動偵測為您存檔</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
