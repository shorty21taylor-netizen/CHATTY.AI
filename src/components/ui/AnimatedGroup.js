'use client';

import { Children, cloneElement, isValidElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PRESET_VARIANTS = {
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
  },
  'blur-slide': {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)', y: 12 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: { type: 'spring', bounce: 0.3, duration: 1.5 },
      },
    },
  },
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: { opacity: 1, scale: 1 },
    },
  },
};

export function AnimatedGroup({
  children,
  className,
  variants,
  preset,
  ...rest
}) {
  const selectedVariants = preset
    ? PRESET_VARIANTS[preset] || PRESET_VARIANTS.fade
    : variants || PRESET_VARIANTS.fade;

  const containerVariants = selectedVariants.container || {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = selectedVariants.item || {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={containerVariants}
        className={className}
        {...rest}
      >
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return child;
          return (
            <motion.div variants={itemVariants}>
              {child}
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
