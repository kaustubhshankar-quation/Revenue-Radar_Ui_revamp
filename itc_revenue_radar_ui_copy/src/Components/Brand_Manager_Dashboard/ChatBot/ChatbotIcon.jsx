/**
 * Revenue bot — Floating avatar icon. (UI)
 */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuationChatbotAvatar({
  open = false,
  onClick,
  thinking = false,
  idleTooltip = "Hello! Need help with data?",
  showBadge = true,
  ariaLabel = "Open Revenue assistant",
}) {
  const [hovered, setHovered] = useState(false);
  const [idleMessage, setIdleMessage] = useState(false);

  useEffect(() => {
    if (open) {
      setIdleMessage(false);
      return undefined;
    }
    const timer = setTimeout(() => setIdleMessage(true), 2500);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <>
      <motion.div className="quation-chatbot-avatar-root">
        <AnimatePresence>
          {!open && (hovered || idleMessage) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="quation-chatbot-tooltip"
            >
              {idleTooltip}
              <span className="quation-chatbot-tooltip-tail" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          whileTap={{ scale: 0.92 }}
          className="quation-chatbot-avatar-btn"
          aria-expanded={open}
          aria-label={ariaLabel}
        >
          <motion.div
            animate={{
              y: hovered || open ? [0, -8, 0] : [0, -5, 0],
              rotate: hovered ? [0, -5, 5, 0] : [0, 1.5, 0],
            }}
            transition={{ duration: hovered ? 0.8 : 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="quation-chatbot-avatar-inner"
          >
            <motion.div
              animate={{ scale: hovered ? [1, 1.12, 1] : [1, 1.04, 1] }}
              transition={{ duration: 1.7, repeat: Infinity }}
              className="quation-chatbot-glow"
            />

            <motion.div
              animate={{ rotate: hovered ? 360 : 0 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="quation-chatbot-ring"
            />

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="quation-chatbot-face"
            >
              <motion.div
                animate={{ scaleY: hovered || thinking ? [1, 0.12, 1] : [1, 1, 0.12, 1] }}
                transition={{ duration: hovered ? 0.8 : 3, repeat: Infinity }}
                className="quation-chatbot-eye quation-chatbot-eye-left"
              />
              <motion.div
                animate={{ scaleY: hovered || thinking ? [1, 0.12, 1] : [1, 1, 0.12, 1] }}
                transition={{ duration: hovered ? 0.8 : 3, repeat: Infinity, delay: 0.1 }}
                className="quation-chatbot-eye quation-chatbot-eye-right"
              />
              <motion.div
                animate={{ width: hovered ? [18, 26, 18] : [20, 24, 20] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="quation-chatbot-mouth"
              />
              <motion.div className="quation-chatbot-cheek quation-chatbot-cheek-left" />
              <motion.div className="quation-chatbot-cheek quation-chatbot-cheek-right" />
            </motion.div>

            <motion.div className="quation-chatbot-sigma">Σ</motion.div>
            <motion.div className="quation-chatbot-dot-accent" />

            <motion.div className="quation-chatbot-antenna-stem" />
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
              className="quation-chatbot-antenna-bulb"
            />

            <motion.div
              animate={{ rotate: hovered ? [-20, 18, -20] : [-8, 8, -8] }}
              transition={{ duration: hovered ? 0.7 : 2, repeat: Infinity, ease: "easeInOut" }}
              className="quation-chatbot-wave-arm"
            >
              <motion.div className="quation-chatbot-arm-upper" />
              <motion.div className="quation-chatbot-arm-hand">
                <span className="quation-chatbot-finger quation-chatbot-finger-1" />
                <span className="quation-chatbot-finger quation-chatbot-finger-2" />
                <span className="quation-chatbot-finger quation-chatbot-finger-3" />
              </motion.div>
            </motion.div>

            <motion.div
              animate={{ opacity: hovered ? [0.4, 1, 0.4] : [0.25, 0.6, 0.25] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="quation-chatbot-sparkle-top"
            >
              ✦
            </motion.div>
            <motion.div
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              className="quation-chatbot-sparkle-bottom"
            >
              ✨
            </motion.div>
          </motion.div>

          {!open && showBadge && (
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="quation-chatbot-badge"
            >
              1
            </motion.span>
          )}
        </motion.button>
      </motion.div>
      <style>{CHATBOT_AVATAR_STYLES}</style>
    </>
  );
}

const CHATBOT_AVATAR_STYLES = `
.quation-chatbot-avatar-root {
  position: relative;
  display: flex;
  justify-content: flex-end;
  width: 104px;
  height: 104px;
  overflow: visible;
}
.quation-chatbot-avatar-btn {
  position: relative;
  width: 104px;
  height: 104px;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 50%;
  outline: none;
  cursor: pointer;
}
.quation-chatbot-avatar-inner {
  position: relative;
  width: 112px;
  height: 112px;
  transform: scale(0.93);
  transform-origin: center;
}
.quation-chatbot-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.2);
  filter: blur(24px);
}
.quation-chatbot-ring {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  border: 12px solid #ea580c;
  border-left-color: transparent;
}
.quation-chatbot-sigma {
  position: absolute;
  left: 4px;
  top: 32px;
  font-size: 48px;
  font-weight: 900;
  line-height: 1;
  color: #ea580c;
  font-family: Inter, system-ui, sans-serif;
}
.quation-chatbot-dot-accent {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ea580c;
}
.quation-chatbot-face {
  position: absolute;
  left: 32px;
  top: 24px;
  width: 72px;
  height: 62px;
  border-radius: 26px;
  border: 6px solid #fff;
  background: #0f172a;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
}
.quation-chatbot-eye {
  position: absolute;
  top: 20px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
}
.quation-chatbot-eye-left { left: 16px; }
.quation-chatbot-eye-right { right: 16px; }
.quation-chatbot-mouth {
  position: absolute;
  bottom: 16px;
  left: 50%;
  height: 8px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #fff;
}
.quation-chatbot-cheek {
  position: absolute;
  bottom: 20px;
  width: 12px;
  height: 8px;
  border-radius: 999px;
  background: #f97316;
}
.quation-chatbot-cheek-left { left: 8px; }
.quation-chatbot-cheek-right { right: 8px; }
.quation-chatbot-antenna-stem {
  position: absolute;
  left: 54px;
  top: 17px;
  width: 12px;
  height: 16px;
  border-radius: 999px;
  background: #334155;
}
.quation-chatbot-antenna-bulb {
  position: absolute;
  left: 48px;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.45);
}
.quation-chatbot-wave-arm {
  position: absolute;
  right: 4px;
  top: 28px;
  transform-origin: bottom center;
}
.quation-chatbot-arm-upper {
  width: 16px;
  height: 36px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
}
.quation-chatbot-arm-hand {
  position: absolute;
  right: -12px;
  top: -8px;
  width: 32px;
  height: 24px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
}
.quation-chatbot-finger {
  position: absolute;
  width: 8px;
  height: 12px;
  border-radius: 999px;
  background: #334155;
}
.quation-chatbot-finger-1 { right: -20px; top: -16px; }
.quation-chatbot-finger-2 { right: -8px; top: -24px; }
.quation-chatbot-finger-3 { right: 4px; top: -20px; }
.quation-chatbot-sparkle-top {
  position: absolute;
  right: -4px;
  top: 12px;
  font-size: 18px;
  color: #f97316;
  line-height: 1;
}
.quation-chatbot-sparkle-bottom {
  position: absolute;
  left: 4px;
  bottom: 12px;
  font-size: 16px;
  color: #f97316;
  line-height: 1;
}
.quation-chatbot-badge {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ea580c;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 0 0 4px #fff;
  font-family: Inter, system-ui, sans-serif;
}
.quation-chatbot-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  left: auto;
  width: max-content;
  max-width: calc(100vw - 48px);
  padding: 8px 12px;
  border-radius: 14px;
  border-bottom-right-radius: 4px;
  background: #fff;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  outline: 1px solid #ffedd5;
  font-family: Inter, system-ui, sans-serif;
  white-space: nowrap;
  text-align: center;
  z-index: 1;
}
.quation-chatbot-tooltip-tail {
  position: absolute;
  bottom: -5px;
  right: 18px;
  width: 10px;
  height: 10px;
  transform: rotate(45deg);
  background: #fff;
  box-shadow: 1px 1px 0 0 #ffedd5;
}
.chatbot-nav-wrapper.popup-open .quation-chatbot-avatar-btn {
  cursor: default;
}
`;
