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
              We were unable to load the 3D visualization. This might be due to browser compatibility issues.
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
                clearcoat={1}
                clearcoatRoughness={0.1}
                envMapIntensity={2}
              />
            </mesh>
            <mesh position={[0, 0.2, 0.1]}>
              <boxGeometry args={[0.4, 0.6, 0.1]} />
              <meshPhysicalMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.9}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            <mesh scale={1.05}>
              <cylinderGeometry args={[0.84, 1.05, 1.58, 6, 1, false]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      case "Lightning":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <group ref={glitchRef}>
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
                <meshPhysicalMaterial
                  ref={materialRef}
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
              <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
              <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
                <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={1}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
            </group>
            <mesh scale={1.2} rotation={[0, Math.PI / 6, 0]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      case "Chain":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <group ref={glitchRef}>
              <mesh position={[-0.6, 0, 0]}>
                <torusGeometry args={[0.3, 0.1, 16, 32]} />
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
                />
              </mesh>
              <mesh position={[0.6, 0, 0]}>
                <torusGeometry args={[0.3, 0.1, 16, 32]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} rotation={[0, 0, Math.PI / 2]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
            </group>
            <mesh scale={1.1}>
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      case "Gear":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <group ref={glitchRef}>
              <mesh>
                <cylinderGeometry args={[0.8, 0.8, 0.2, 16]} />
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
                />
              </mesh>
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2
                const x = Math.cos(angle) * 0.8
                const y = Math.sin(angle) * 0.8
                return (
                  <mesh key={i} position={[x, y, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshPhysicalMaterial
                      color={color}
                      emissive={color}
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
            <mesh scale={1.1} rotation={[0, Math.PI / 8, 0]}>
              <cylinderGeometry args={[0.88, 0.88, 0.22, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      case "Database":
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <group ref={glitchRef}>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
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
                />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.5, 0.5, 0.3, 16]} />
                <meshPhysicalMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.8}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
            </group>
            <mesh scale={1.1}>
              <cylinderGeometry args={[0.55, 0.55, 1.3, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.1} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
      default:
        return (
          <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
            <mesh ref={glitchRef}>
              <sphereGeometry args={[0.5, 16, 16]} />
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
              />
            </mesh>
            <mesh scale={1.1}>
              <sphereGeometry args={[0.55, 8, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.2} wireframe side={THREE.BackSide} />
            </mesh>
          </group>
        )
    }
  }

  return renderHolographicIcon()
}

// Enhanced Cosmic Trail Effect
function EnhancedCosmicTrail({ target, active, color }) {
  const trailRef = useRef()
  const trailMaterialRef = useRef()

  useFrame(() => {
    if (trailMaterialRef.current) {
      trailMaterialRef.current.opacity = active
        ? THREE.MathUtils.lerp(trailMaterialRef.current.opacity, 0.7, 0.1)
        : THREE.MathUtils.lerp(trailMaterialRef.current.opacity, 0, 0.05)
    }
  })

  return (
    <Trail
      ref={trailRef}
      width={3.0} // Wider for more visibility
      length={20} // Longer for more ray-like appearance
      color={color}
      attenuation={(t) => (1 - t) ** 2.5} // Sharper attenuation for ray-like effect
      target={target}
    >
      <meshBasicMaterial ref={trailMaterialRef} transparent opacity={0} blending={THREE.AdditiveBlending} />
    </Trail>
  )
}

// Enhanced Northern Lights Effect - Updated with more ionic blue colors
function EnhancedNorthernLights({ active, intensity = 1 }) {
  const count = 200 // Increased particle count
  const pointsRef = useRef()
  const materialRef = useRef()

  // Create points for northern lights effect with ionic blue colors
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 25 // Wider spread
      positions[i3 + 1] = (Math.random() - 0.5) * 15
      positions[i3 + 2] = (Math.random() - 0.5) * 25

      // Create gradient colors with more ionic blue hues and just a hint of neon green
      const t = Math.random()
      if (t < 0.5) {
        // Ionic blue
        colors[i3] = 0.1
        colors[i3 + 1] = 0.6
        colors[i3 + 2] = 0.9
      } else if (t < 0.8) {
        // Electric blue
        colors[i3] = 0.2
        colors[i3 + 1] = 0.4
        colors[i3 + 2] = 1.0
      } else {
        // Hint of neon green
        colors[i3] = 0.2
        colors[i3 + 1] = 0.8
        colors[i3 + 2] = 0.7
      }

      // Vary particle sizes using golden ratio
      sizes[i] = 0.5 + (Math.random() * 1.5) / PHI
    }

    return [positions, colors, sizes]
  }, [count])

  // Animate the northern lights
  useFrame(({ clock }) => {
    if (pointsRef.current && materialRef.current) {
      const time = clock.getElapsedTime() * 0.2

      const positions = pointsRef.current.geometry.attributes.position.array

      for (let i = 0; i < count; i++) {
        const i3 = i * 3

        // Create more dynamic wave-like motion using golden ratio
        positions[i3 + 1] =
          Math.sin(time + positions[i3] * 0.1) * 3 +
          Math.sin(time * 0.8 + positions[i3 + 2] * 0.1) * 3 +
          Math.sin(time * PHI + positions[i3] * 0.05) * 2 // Additional wave with golden ratio timing
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true

      // Adjust opacity based on active state with higher base visibility
      materialRef.current.opacity = active
        ? THREE.MathUtils.lerp(materialRef.current.opacity, 0.9 * intensity, 0.05)
        : THREE.MathUtils.lerp(materialRef.current.opacity, 0.2, 0.05) // Keep some visibility even when not active
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={1.0} // Larger base size
        transparent
        opacity={0.2} // Start with some visibility
        vertexColors
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// Hexagonal face component with golden ratio proportions and pulsating inner light
function HexagonalFace({ index, position, rotation, feature, onClick, hovered }) {
  const IconComponent = feature.icon
  const hexRadius = 1 // Base radius
  const innerRadius = hexRadius / PHI // Golden ratio for inner elements
  const depth = 0.2 // Depth of the hexagonal prism

  // Create hexagonal prism geometry
  const geometry = useMemo(() => createHexagonalPrismGeometry(hexRadius, depth), [hexRadius, depth])

  // Refs for animations
  const groupRef = useRef()
  const glowRef = useRef()
  const innerLightRef = useRef()

  // Hover animation
  useFrame(() => {
    if (groupRef.current) {
      if (hovered) {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0.2, 0.1)
      } else {
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1)
      }
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = hovered
        ? THREE.MathUtils.lerp(glowRef.current.material.opacity, 0.8, 0.1)
        : THREE.MathUtils.lerp(glowRef.current.material.opacity, 0.3, 0.1)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick(feature)
        }}
        onPointerOver={(e) => {
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = "auto"
        }}
      >
        {/* Base hexagonal prism */}
        <mesh geometry={geometry} receiveShadow castShadow>
          <meshPhysicalMaterial
            color="#1e293b"
            metalness={0.5}
            roughness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.2}
            envMapIntensity={1}
            transparent
            opacity={0.85} // Slightly transparent to see inner light
          />
        </mesh>

        {/* Glow effect */}
        <mesh ref={glowRef} geometry={geometry} position={[0, 0, -0.05]} scale={1.05}>
          <meshBasicMaterial color={feature.color} transparent={true} opacity={0.3} side={THREE.BackSide} />
        </mesh>

        {/* Feature name with enhanced visibility */}
        <Text
          position={[0, hexRadius * 0.5, depth / 2 + 0.05]}
          fontSize={hexRadius * 0.22} // Slightly larger font
          color="#ffffff" // Pure white
          anchorX="center"
          anchorY="middle"
          font={undefined}
          maxWidth={hexRadius * 1.5}
          textAlign="center"
          fontWeight="bold"
        >
          {feature.name}
        </Text>

        {/* Then add this right behind the Text component to create a subtle glow effect: */}
        <mesh position={[0, hexRadius * 0.5, depth / 2 + 0.03]}>
          <planeGeometry args={[hexRadius * 1.2, hexRadius * 0.3]} />
          <meshBasicMaterial
            color={feature.color}
            transparent={true}
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Holographic Feature Icon - replaces both the PulsatingLight and Icon3D */}
        <group position={[0, -hexRadius * 0.2, depth / 2 - 0.1]}>
          <HolographicIcon type={feature.icon3D} color={feature.color} scale={0.35} />
        </group>
      </group>
    </group>
  )
}

// Connection line component with energy flow
function EnhancedConnectionLine({ start, end, color, visible }) {
  const ref = useRef()

  useEffect(() => {
    if (ref.current) {
      const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
      ref.current.geometry = lineGeometry
    }
  }, [start, end])

  return (
    <>
      <line ref={ref}>
        <bufferGeometry />
        <lineBasicMaterial color={color} transparent opacity={visible ? 1 : 0} linewidth={2} />
      </line>
      <EnergyFlow from={start} to={end} color={color} active={visible} speed={1 + Math.random() * 0.5} />
    </>
  )
}

// Particles effect component
function EnhancedParticlesEffect() {
  return (
    <Sparkles
      count={150} // More particles
      scale={12} // Larger scale
      size={0.6} // Larger particles
      speed={0.3}
      opacity={0.6} // More visible
      color={"#ffffff"}
    />
  )
}

// Create a component for the hexagonal prism
function HexagonalPrism({ setSelectedFeature }) {
  const groupRef = useRef()
  const [rotationAxis, setRotationAxis] = useState({ x: 0, y: 1, z: 0 })
  const [rotationSpeed, setRotationSpeed] = useState(0.005)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [centerPoint] = useState([0, 0, 0])
  const [isDragging, setIsDragging] = useState(false)
  const [dragIntensity, setDragIntensity] = useState(0)
  const { camera } = useThree()

  // Change rotation randomly
  const changeRotation = () => {
    // Generate random rotation axis
    const newAxis = {
      x: Math.random() * 0.2,
      y: Math.random() * 0.8 + 0.2, // Keep y as primary rotation axis
      z: Math.random() * 0.2,
    }

    // Normalize the vector
    const length = Math.sqrt(newAxis.x ** 2 + newAxis.y ** 2 + newAxis.z ** 2)
    newAxis.x /= length
    newAxis.y /= length
    newAxis.z /= length

    // Set new rotation speed (between 0.003 and 0.008)
    const newSpeed = 0.003 + Math.random() * 0.005

    setRotationAxis(newAxis)
    setRotationSpeed(newSpeed)
  }

  // Initial random rotation
  useEffect(() => {
    changeRotation()

    // Setup drag detection
    const handleDragStart = () => setIsDragging(true)
    const handleDragEnd = () => {
      setIsDragging(false)
      // Don't immediately reset intensity to allow trails to fade naturally
      setTimeout(() => setDragIntensity(0), 1000)
    }

    window.addEventListener("mousedown", handleDragStart)
    window.addEventListener("touchstart", handleDragStart)
    window.addEventListener("mouseup", handleDragEnd)
    window.addEventListener("touchend", handleDragEnd)

    return () => {
      window.removeEventListener("mousedown", handleDragStart)
      window.removeEventListener("touchstart", handleDragStart)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchend", handleDragEnd)
    }
  }, [])

  // Previous rotation for calculating velocity
  const prevRotation = useRef({ x: 0, y: 0, z: 0 })

  // Animation loop
  useFrame(() => {
    if (groupRef.current) {
      // Auto rotation when not dragging
      if (!isDragging) {
        groupRef.current.rotation.x += rotationAxis.x * rotationSpeed
        groupRef.current.rotation.y += rotationAxis.y * rotationSpeed
        groupRef.current.rotation.z += rotationAxis.z * rotationSpeed
      }

      // Calculate rotation velocity for trail intensity
      const rotVelocity = {
        x: Math.abs(groupRef.current.rotation.x - prevRotation.current.x),
        y: Math.abs(groupRef.current.rotation.y - prevRotation.current.y),
        z: Math.abs(groupRef.current.rotation.z - prevRotation.current.z),
      }

      const totalVelocity = rotVelocity.x + rotVelocity.y + rotVelocity.z
      setDragIntensity(isDragging ? Math.min(totalVelocity * 200, 1) : dragIntensity * 0.95) // Slower decay

      // Store current rotation for next frame
      prevRotation.current = {
        x: groupRef.current.rotation.x,
        y: groupRef.current.rotation.y,
        z: groupRef.current.rotation.z,
      }
    }
  })

  // Calculate positions for each face using golden ratio
  const getFacePositions = () => {
    const positions = []
    const radius = PHI * 1.2 // Use golden ratio for radius, slightly larger for better visibility
    const height = radius / PHI // Height based on golden ratio

    // Side faces
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius

      positions.push({
        position: [x, 0, z],
        rotation: [0, -angle + Math.PI, 0],
        connectionStart: [x * 0.2, 0, z * 0.2], // Start point near the face
        connectionEnd: centerPoint, // End at center
      })
    }

    return positions
  }

  const facePositions = getFacePositions()

  return (
    <Float
      speed={2} // Animation speed
      rotationIntensity={0.2} // XYZ rotation intensity
      floatIntensity={0.2} // Up/down float intensity
    >
      <group ref={groupRef} onClick={() => changeRotation()} onPointerMissed={() => changeRotation()}>
        {/* Central node with holographic logo */}
        <group position={centerPoint}>
          {/* Base glow effect */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshBasicMaterial color="#40C4FF" transparent opacity={0.2} />
          </mesh>

          {/* Holographic logo */}
          <HolographicLogo position={[0, 0, 0]} scale={0.8} />

          {/* Pulsating core light - enhanced */}
          <PulsatingLight
            color="#40C4FF"
            intensity={0.8}
            frequency={0.3}
            offset={0}
            position={[0, 0, 0]}
            scale={0.9} // Smaller light to not overwhelm the logo
          />
        </group>

        {/* Enhanced cosmic trails for central node - now ionic electric blue rays */}
        <EnhancedCosmicTrail target={groupRef} active={isDragging || dragIntensity > 0.1} color="#00BFFF" />
        <EnhancedCosmicTrail target={groupRef} active={isDragging || dragIntensity > 0.1} color="#4FC3F7" />
        <EnhancedCosmicTrail target={groupRef} active={isDragging || dragIntensity > 0.1} color="#40C4FF" />

        {/* Enhanced Northern Lights Effect */}
        <EnhancedNorthernLights active={isDragging || dragIntensity > 0.2} intensity={dragIntensity} />

        {/* Connection lines with energy flow */}
        {facePositions.map((face, index) => (
          <EnhancedConnectionLine
            key={`connection-${index}`}
            start={face.connectionStart}
            end={face.connectionEnd}
            color={features[index].color}
            visible={hoveredIndex === index || Math.random() < 0.2} // Occasionally show connections
          />
        ))}

        {/* Feature faces with pulsating inner light */}
        {features.map((feature, index) => (
          <HexagonalFace
            key={index}
            index={index}
            position={facePositions[index].position}
            rotation={facePositions[index].rotation}
            feature={feature}
            onClick={setSelectedFeature}
            hovered={hoveredIndex === index}
            onHover={() => setHoveredIndex(index)}
            onUnhover={() => setHoveredIndex(null)}
          />
        ))}

        {/* Enhanced particle effects */}
        <EnhancedParticlesEffect />
      </group>
    </Float>
  )
}

// Main component
export default function FeaturePrism() {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [cameraPosition, setCameraPosition] = useState([0, 0, 8])

  // Responsive camera position
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setCameraPosition([0, 0, isMobile ? 10 : 8])
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <ErrorBoundary>
      <div className="w-full h-full relative">
        <Canvas shadows dpr={[1, 2]}>
          <color attach="background" args={["#0a1a2f"]} /> {/* Arctic midnight blue background */}
          <fog attach="fog" args={["#0a1a2f", 5, 20]} /> {/* Matching fog color */}
          <PerspectiveCamera makeDefault position={cameraPosition} fov={45} />
          {/* Lighting setup */}
          <ambientLight intensity={0.2} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
          {/* Environment for reflections */}
          <Environment preset="night" />
          {/* Main 3D content */}
          <HexagonalPrism setSelectedFeature={setSelectedFeature} />
          {/* Controls */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate={false}
            dampingFactor={0.05}
            enableDamping={true}
          />
        </Canvas>

        {/* Feature Modal */}
        <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
          <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700 high-tech-panel">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                {selectedFeature && (
                  <>
                    {React.createElement(selectedFeature.icon, {
                      className: "h-6 w-6",
                      style: { color: selectedFeature.color },
                    })}
                    <span style={{ color: selectedFeature.color }}>{selectedFeature.name}</span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-200 text-lg leading-relaxed">{selectedFeature?.description}</p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setSelectedFeature(null)}
                style={{
                  backgroundColor: selectedFeature?.color,
                  borderColor: selectedFeature?.color,
                }}
                className="hover:opacity-90 high-tech-button"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instructions overlay */}
        
      </div>
    </ErrorBoundary>
  )
}
