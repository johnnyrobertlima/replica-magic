import { motion } from "framer-motion";

export const Hero = () => {
  return (
    <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative container-custom h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-3xl px-4"
        >
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            ONIPRESENÇA DIGITAL
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8">
            Transforme sua presença online com soluções digitais inovadoras
          </p>
          <button className="btn-primary">
            Saiba Mais
          </button>
        </motion.div>
      </div>
    </div>
  );
};