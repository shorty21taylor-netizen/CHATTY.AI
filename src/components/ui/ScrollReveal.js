'use client';

import { motion } from 'framer-motion';

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, ease: 'easeOut' },
    },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -60, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
    },
  },
  slideRight: {
    hidden: { opacity: 0, x: 60, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  amount = 0.25,
  once = true,
  className = '',
  style = {},
}) {
  const chosen = variants[variant] || variants.fadeUp;
  const withDelay = {
    ...chosen,
    visible: {
      ...chosen.visible,
      transition: { ...chosen.visible.transition, delay },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={withDelay}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function ScrollStagger({
  children,
  amount = 0.2,
  once = true,
  className = '',
  style = {},
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function ScrollItem({
  variant = 'fadeUp',
  children,
  className = '',
  style = {},
}) {
  const chosen = variants[variant] || variants.fadeUp;
  return (
    <motion.div variants={chosen} className={className} style={style}>
      {children}
    </motion.div>
  );
}
