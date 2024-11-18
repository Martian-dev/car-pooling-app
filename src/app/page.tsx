"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UserPlus, LogIn, User, Edit, Eye } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function Component() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNeonLine = () => ({
      x: Math.random() * canvas.width,
      y: 0,
      length: Math.random() * 100 + 50,
      speed: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
    });

    let neonLines: ReturnType<typeof createNeonLine>[] = Array(50)
      .fill(null)
      .map(createNeonLine);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      neonLines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.length);
        ctx.strokeStyle = line.color;
        ctx.shadowColor = line.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.stroke();

        line.y += line.speed;
        if (line.y > canvas.height) {
          Object.assign(line, createNeonLine());
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-teal-800/50 pointer-events-none" />
      <header className="relative w-full p-4 bg-black/30 backdrop-blur-sm z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 5L5 35H35L20 5Z"
                fill="currentColor"
                fillOpacity="0.5"
              />
              <path d="M20 15L10 35H30L20 15Z" fill="currentColor" />
            </svg>
            <span className="sr-only">NEO RIDE</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <UserPlus className="h-5 w-5" />
              <span className="sr-only">Sign Up</span>
            </Button>
            <Button variant="ghost" size="icon">
              <LogIn className="h-5 w-5" />
              <span className="sr-only">Sign In</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Account Details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="relative flex-grow flex flex-col items-center justify-center p-4 z-10">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-8 text-center text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Dynamic Ride Sharing
        </motion.h1>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-12 text-cyan-300"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          NEO RIDE
        </motion.h2>
        {mounted && (
          <motion.div
            className="text-xl sm:text-2xl mb-8 text-center text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="mb-4">Choose your neon path:</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                className="px-8 py-3 rounded-full bg-pink-600 text-white font-semibold shadow-lg hover:bg-pink-700 transition duration-300 ease-in-out hover:shadow-pink-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/maps">I need a ride</Link>
              </motion.button>
              <motion.button
                className="px-8 py-3 rounded-full bg-cyan-600 text-white font-semibold shadow-lg hover:bg-cyan-700 transition duration-300 ease-in-out hover:shadow-cyan-500/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/maps">I can drive</Link>
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
