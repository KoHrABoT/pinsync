import { motion } from "framer-motion";
import { Lightbulb, Image, Star } from "lucide-react";
import "./App.css";

function About() {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 80, opacity: 0, rotate: -2 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.8,
      },
    },
  };

  const headingVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.6, type: "spring", stiffness: 120, damping: 12 },
    },
    hover: { scale: 1.2, rotate: 15, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-6 relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black opacity-20 rounded-lg" />

      <motion.div
        className="about-card relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-10 backdrop-blur-md bg-opacity-90 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]"
        variants={cardVariants}
      >
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center"
          variants={headingVariants}
        >
          About{" "}
          <motion.span
            className="text-pink-500"
            animate={{ color: ["#ec4899", "#f472b6", "#ec4899"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            PinSync
          </motion.span>
        </motion.h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center flex flex-col items-center">
          <motion.div
            className="flex items-center space-x-4"
            variants={rowVariants}
          >
            <motion.div variants={iconVariants} whileHover="hover">
              <Lightbulb className="text-yellow-500 w-10 h-10" />
            </motion.div>
            <motion.p variants={textVariants}>
              Pinsync is a visual search engine that inspires through "Pinterest & same.energy".
            </motion.p>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            variants={rowVariants}
          >
            <motion.div variants={iconVariants} whileHover="hover">
              <Image className="text-blue-500 w-10 h-10" />
            </motion.div>
            <motion.p variants={textVariants}>
              We prioritize visual discovery, blending style and mood into every search.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex items-center space-x-4"
            variants={rowVariants}
          >
            <motion.div variants={iconVariants} whileHover="hover">
              <Star className="text-green-500 w-10 h-10" />
            </motion.div>
            <motion.p variants={textVariants}>
              Explore, inspire, and create with <b>Pinsync</b> as your creative guide.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default About;
