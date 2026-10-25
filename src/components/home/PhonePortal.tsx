import { motion } from "motion/react";
import { Route } from "lucide-react";
export default function PhonePortal({
  rect,
  done,
}: {
  rect: { left: number; top: number; width: number; height: number };
  done: () => void;
}) {
  return (
    <div
      className="phone-portal"
      role="status"
      aria-label="Entering your PathAble journey"
    >
      <motion.div
        className="portal-surface"
        initial={{ ...rect, borderRadius: 24, rotate: -4, opacity: 0.5 }}
        animate={{
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          borderRadius: 0,
          rotate: 0,
          opacity: 1,
        }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={done}
      >
        <img src="/images/pathable-screen.png" alt="" />
        <motion.div
          className="portal-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.35 }}
        >
          <span className="brand-icon">
            <Route size={26} />
          </span>
          <span>YOUR JOURNEY STARTS WITH YOU</span>
          <strong>A world of possibility.</strong>
          <div className="portal-line" />
        </motion.div>
      </motion.div>
    </div>
  );
}
