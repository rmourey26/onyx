// @ts-nocheck 

"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Text, PerspectiveCamera, OrbitControls, Environment, Float, Sparkles, Trail } from "@react-three/drei"
import * as THREE from "three"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CuboidIcon, Shield, Zap, Link, Cog, Database } from "lucide-react"

// Add this after the imports
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D rendering error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-arctic-gradient">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              We couldn't load the 3D visualization. This might be due to browser compatibility issues.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Define our features
const features = [
  {
    name: "Traceability",
    icon: CuboidIcon,
    description:
      "End-to-end visibility of products throughout the supply chain, ensuring authenticity and origin verification.",
    color: "#3b82f6",
    icon3D: "Cube",
    pulseOffset: 0, // Offset for pulsing effect
  },
  {
    name: "Security",
    icon: Shield,
    description:
      "Immutable and encrypted data storage protecting sensitive information across the entire logistics network.",
    color: "#10b981",
    icon3D: "Shield",
    pulseOffset: 1, // Offset for pulsing effect
  },
  {
    name: "Efficiency",
    icon: Zap,
    description:
      "Streamlined processes and reduced costs through optimized routing and real-time inventory management.",
    color: "#f59e0b",
    icon3D: "Lightning",
    pulseOffset: 2, // Offset for pulsing effect
  },
  {
    name: "Integration",
    icon: Link,
    description:
      "Seamless connection with existing systems including ERP, WMS, and other supply chain management tools.",
    color: "#8b5cf6",
    icon3D: "Chain",
    pulseOffset: 3, // Offset for pulsing effect
  },
  {
    name: "Automation",
    icon: Cog,
    description: "AI-driven decision making and operations that reduce human error and increase operational speed.",
    color: "#ec4899",
    icon3D: "Gear",
    pulseOffset: 5, // Offset for pulsing effect (Fibonacci)
  },
  {
    name: "Data",
    icon: Database,
    description: "Comprehensive analytics and insights derived from blockchain-secured supply chain data.",
    color: "#06b6d4",
    icon3D: "Database",
    pulseOffset: 8, // Offset for pulsing effect (Fibonacci)
  },
]

// Golden ratio constant
const PHI = 1.618033988749895

// Fibonacci sequence for timing
const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]

// Create a hexagon shape
function createHexagonShape(radius = 1) {
  const shape = new THREE.Shape()
  const sides = 6

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius

    if (i === 0) {
      shape.moveTo(x, y)
    } else {
      shape.lineTo(x, y)
    }
  }

  shape.closePath()
  return shape
}

// Create a hexagonal prism geometry
function createHexagonalPrismGeometry(radius = 1, height = 0.2) {
  const shape = createHexagonShape(radius)
  const extrudeSettings = {
    steps: 1,
    depth: height,
    bevelEnabled: false,
  }
  return new THREE.ExtrudeGeometry(shape, extrudeSettings)
}

// Pulsating Inner Light Component
function PulsatingLight({ color, intensity = 1, frequency = 1, offset = 0, position = [0, 0, 0], scale = 1 }) {
  const lightRef = useRef()
  const materialRef = useRef()

  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Use Fibonacci sequence to create natural-looking pulsation
      const time = clock.getElapsedTime() * frequency
      const fibIndex = Math.floor(time % 10)
      const fibFactor = FIBONACCI[fibIndex] / 34 // Normalize to 0-1 range approximately

      // Create pulsation with golden ratio influence
      const pulse = Math.sin(time + offset * PHI) * 0.5 + 0.5
      const finalIntensity = intensity * pulse * (1 + fibFactor / PHI)

      // Reduced opacity and intensity values
      materialRef.current.opacity = finalIntensity * 0.6 // Reduced from 1.0 to 0.6
      materialRef.current.emissiveIntensity = finalIntensity * 1.2 // Reduced from 2.0 to 1.2
    }
  })

  return (
    <mesh ref={lightRef} position={position} scale={scale}>
      <sphereGeometry args={[0.8, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.8} // Reduced from 1.0 to 0.8
        transparent
        opacity={0.5} // Reduced from 0.8 to 0.5
      />
    </mesh>
  )
}

// Energy Flow Effect
function EnergyFlow({ from, to, color, active, speed = 1 }) {
  const particlesRef = useRef()
  const count = 20
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Initialize all particles at the starting position
      positions[i * 3] = from[0]
      positions[i * 3 + 1] = from[1]
      positions[i * 3 + 2] = from[2]

      // Vary the sizes slightly using golden ratio
      sizes[i] = 0.05 + (i % 3) * 0.03 * PHI
    }

    return [positions, sizes]
  }, [from, to, count])

  useFrame(({ clock }) => {
    if (particlesRef.current && active) {
      const time = clock.getElapsedTime() * speed
      const positions = particlesRef.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const particleOffset = (i / count) * PHI * 2 // Use golden ratio for offset

        // Calculate progress along the path (0 to 1)
        const progress = (time * 0.5 + particleOffset) % 1

        // Interpolate position between from and to
        positions[i3] = from[0] + (to[0] - from[0]) * progress
        positions[i3 + 1] = from[1] + (to[1] - from[1]) * progress
        positions[i3 + 2] = from[2] + (to[2] - from[2]) * progress

        // Add some sinusoidal movement perpendicular to the path
        const perpX = -(to[1] - from[1])
        const perpZ = to[0] - from[0]
        const perpLength = Math.sqrt(perpX * perpX + perpZ * perpZ)
        if (perpLength > 0) {
          const normalizedPerpX = perpX / perpLength
          const normalizedPerpZ = perpZ / perpLength
          const sineWave = Math.sin(progress * Math.PI * 2 * 3) * 0.1
          positions[i3] += normalizedPerpX * sineWave
          positions[i3 + 2] += normalizedPerpZ * sineWave
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={active ? 0.8 : 0}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// 3D Icon Components
const Icon3D = ({ type, color, scale = 0.3, position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
    }
  })

  // Create different 3D geometries based on icon type
  const renderIcon = () => {
    switch (type) {
      case "Cube":
        return (
          <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        )
      case "Shield":
        return (
          <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <mesh>
              <cylinderGeometry args={[0.8, 1, 1.5, 6, 1, false]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.2, 0.1]}>
              <boxGeometry args={[0.4, 0.6, 0.1]} />
              <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        )
      case "Lightning":
        return (
          <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
              <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          </group>
        )
      case "Chain":
        return (
          <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <mesh position={[-0.6, 0, 0]}>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.6, 0, 0]}>
              <torusGeometry args={[0.3, 0.1, 16, 32]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )
      case "Gear":
        return (
          <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <mesh>
              <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2
              const x = Math.cos(angle) * 0.8
              const y = Math.sin(angle) * 0.8
              return (
                <mesh key={i} position={[x, y, 0]}>
                  <boxGeometry args={[0.2, 0.2, 0.2]} />
                  <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
                </mesh>
              )
            })}
          </group>
        )
      case "Database":
        return (
          <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
              <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
              <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} />
            </mesh>
          </group>
        )
      default:
        return (
          <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </mesh>
        )
    }
  }

  return renderIcon()
}

// Holographic Logo Component
function HolographicLogo({ position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const glitchRef = useRef()

  // Logo color from the provided image
  const logoColor = "#2e8b57" // Medium sea green color similar to the logo

  // Animation for holographic effect
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }

    if (materialRef.current) {
      // Pulsating opacity
      const time = clock.getElapsedTime()
      materialRef.current.opacity = 0.7 + Math.sin(time * 1.5) * 0.15

      // Subtle color shifting
      const hue = 0.4 + Math.sin(time * 0.2) * 0.05 // Subtle shift around green hue
      materialRef.current.emissive.setHSL(hue, 0.8, 0.5)
    }

    // Random glitches
    if (glitchRef.current && Math.random() < 0.01) {
      glitchRef.current.position.x = (Math.random() - 0.5) * 0.05
      setTimeout(() => {
        if (glitchRef.current) glitchRef.current.position.x = 0
      }, 100)
    }
  })

  // Create the X-shaped logo with rounded cylinders
  return (
    <group ref={groupRef} position={position} scale={scale}>
      <group ref={glitchRef}>
        {/* First diagonal line of the X */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8, 1, false]} />
          <meshPhysicalMaterial
            ref={materialRef}
            color={logoColor}
            emissive={logoColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            metalness={0.5}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
          />
        </mesh>

        {/* Second diagonal line of the X */}
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8, 1, false]} />
          <meshPhysicalMaterial
            color={logoColor}
            emissive={logoColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
            metalness={0.5}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
          />
        </mesh>

        {/* Spheres at the ends of the X for rounded caps */}
        {[45, 135, 225, 315].map((angle, i) => {
          const radians = (angle * Math.PI) / 180
          const x = Math.cos(radians) * 0.6
          const y = Math.sin(radians) * 0.6
          return (
            <mesh key={i} position={[x, y, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshPhysicalMaterial
                color={logoColor}
                emissive={logoColor}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
                metalness={0.5}
                roughness={0.2}
                clearcoat={1}
              />
            </mesh>
          )
        })}
      </group>

      {/* Outer glow effect */}
      <mesh scale={1.2}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={logoColor} transparent opacity={0.1} />
      </mesh>

      {/* Wireframe outer shell */}
      <mesh scale={1.3} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color={logoColor} transparent opacity={0.1} wireframe side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

// Add this new component after the Icon3D component:
function HolographicIcon({ type, color, scale = 0.3, position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const glitchRef = useRef()

  // Create a scan line effect
  const scanLineTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext("2d")
    context.fillStyle = "black"
    context.fillRect(0, 0, 256, 256)
    context.strokeStyle = color
    context.lineWidth = 1

    // Draw horizontal scan lines
    for (let i = 0; i < 256; i += 4) {
      context.beginPath()
      context.moveTo(0, i)
      context.lineTo(256, i)
      context.globalAlpha = 0.1 + Math.random() * 0.1
      context.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(5, 5)
    return texture
  }, [color])

  // Animation for holographic effect
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01
    }

    if (materialRef.current) {
      // Pulsating opacity
      const time = clock.getElapsedTime()
      materialRef.current.opacity = 0.7 + Math.sin(time * 2) * 0.15

      // Color shifting
      const hue = (time * 0.1) % 1
      materialRef.current.emissive.setHSL(hue, 0.5, 0.5)

      // Scan line movement
      scanLineTexture.offset.y = (time * 0.2) % 1
    }

    // Random glitches
    if (glitchRef.current && Math.random() < 0.01) {
      glitchRef.current.position.x = (Math.random() - 0.5) * 0.05
      setTimeout(() => {
        if (glitchRef.current) glitchRef.current.position.x = 0
      }, 100)
    }
  })

  // Create different 3D geometries based on icon type
  const renderHolographicIcon = () => {
    // Use the same geometry as Icon3D but with holographic materials
    switch (type) {
      case "Cube":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <mesh ref={glitchRef}>
              <boxGeometry args={[1, 1, 1]} />
              <meshPhysicalMaterial
                ref={materialRef}
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
                metalness={0.5}
                roughness={0.2}
                clearcoat={1}
                clearcoatRoughness={0.1}
                envMapIntensity={2}
              />
            </mesh>
            <mesh scale={1.05}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} wireframe side={THREE.BackSide} />
            </mesh>
            <mesh scale={1.1} rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      case "Shield":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <mesh ref={glitchRef}>
              <cylinderGeometry args={[0.8, 1, 1.5, 6, 1, false]} />
              <meshPhysicalMaterial
                ref={materialRef}
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.8}
                metalness={0.5}
                roughness={0.2}
                clear