/**
 * @fileoverview React component for rendering fireworks-style confetti animations using the canvas-confetti library.
 * This component triggers a timed animation of confetti particles originating from two sides of the screen when activated.
 */

import confetti from "canvas-confetti"
import { useEffect } from "react";
import { View } from "react-native";

/**
 * @typedef {Object} FireworksProps
 * @property {boolean} trigger - Flag to trigger the fireworks animation
 */
type FireworksProps = {
    trigger: boolean
}

/**
 * React component that renders a fireworks-style confetti animation.
 * @param {FireworksProps} props - The component props
 * @returns {JSX.Element} A View element that triggers the animation
 */
export function ConfettiFireworks(props: FireworksProps) {
    useEffect(() => {
        if (props.trigger) {
            animate()
        }
    }, [props.trigger])

    /**
     * Triggers the fireworks animation by setting up an interval to fire confetti particles.
     * The animation lasts for 5 seconds, firing particles from two origins on the screen.
     */
    const animate = () => {
        const duration = 5 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        /**
         * Generates a random number within the specified range.
         * @param {number} min - The minimum value (inclusive)
         * @param {number} max - The maximum value (exclusive)
         * @returns {number} A random number between min and max
         */
        const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
        }, 250)
    }

    return (
        <View key="confetti-fireworks"></View>
    )
}
