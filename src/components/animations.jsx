import { motion, AnimatePresence } from 'framer-motion';

/* ───────────────────────────────────────────
   Pattern 1: Scroll Reveal (Fade + Slide)
─────────────────────────────────────────────── */
const fadeInVariants = {
  hidden: (dir) => ({
    opacity: 0,
    x: dir === 'left' ? -32 : dir === 'right' ? 32 : 0,
    y: dir === 'up' ? 32 : dir === 'down' ? -32 : 0,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function FadeIn({ children, delay = 0, direction = 'up', duration = 0.5, once = true, className, ...rest }) {
  return (
    <motion.div
      custom={direction}
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      transition={{ delay, duration, ease: 'easeOut' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   Pattern 2: Tactile Hover & Tap (Cards/Buttons)
─────────────────────────────────────────────── */
export function HoverCard({ children, className, ...rest }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   Pattern 3: Staggered List Entrance
─────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function StaggerList({ children, className, once = true, ...rest }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-20px' }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, ...rest }) {
  return (
    <motion.div variants={itemVariants} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   Pattern 4: AnimatePresence (Modal / Menu)
─────────────────────────────────────────────── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.15, ease: 'easeIn' } },
};

export function AnimatedModal({ isOpen, onClose, children, className }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative z-10 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden ${className || ''}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SlideMenu({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
