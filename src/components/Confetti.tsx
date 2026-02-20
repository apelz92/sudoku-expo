/**
 * @fileoverview React component for rendering canvas-based confetti effects using the canvas-confetti library.
 * Provides a forwardRef component that manages a confetti instance, allowing programmatic firing of confetti animations.
 * Supports global options for resizing and worker usage, and can be controlled manually or auto-start.
 * Includes a context provider for sharing the confetti API with child components.
 */

import type { ReactNode } from "react"
import React, {
    createContext,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
} from "react"
import type {
    GlobalOptions as ConfettiGlobalOptions,
    CreateTypes as ConfettiInstance,
    Options as ConfettiOptions,
} from "canvas-confetti"
import confetti from "canvas-confetti"

/**
 * @typedef {Object} Api
 * @property {function(ConfettiOptions=): void} fire - Triggers the confetti animation with optional configuration overrides.
 */
type Api = {
    fire: (options?: ConfettiOptions) => void
}

/**
 * @typedef {Object} Props
 * @property {ConfettiOptions} [options] - Default confetti options for the animation.
 * @property {ConfettiGlobalOptions} [globalOptions] - Global options for the confetti instance, such as resize and worker settings.
 * @property {boolean} [manualstart] - If true, prevents automatic firing on mount; requires manual triggering via ref.
 * @property {ReactNode} [children] - Child components to render within the confetti context.
 */
type Props = React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions
    globalOptions?: ConfettiGlobalOptions
    manualstart?: boolean
    children?: ReactNode
}

/**
 * @typedef {Api | null} ConfettiRef - Ref type for the Confetti component, exposing the API or null if not initialized.
 */
export type ConfettiRef = Api | null

/**
 * @const {React.Context<Api>} ConfettiContext - React context for sharing the confetti API with child components.
 */
const ConfettiContext = createContext<Api>({} as Api)

// Define component first
/**
 * @function ConfettiComponent
 * @param {Props} props - Component props including options, globalOptions, manualstart, and children.
 * @param {React.Ref<ConfettiRef>} ref - Ref to access the confetti API.
 * @returns {JSX.Element} The rendered canvas element wrapped in a context provider.
 */
const ConfettiComponent = forwardRef<ConfettiRef, Props>((props, ref) => {
    const {
        options,
        globalOptions = { resize: true, useWorker: true },
        manualstart = false,
        children,
        ...rest
    } = props
    const instanceRef = useRef<ConfettiInstance | null>(null)

    /**
     * @callback canvasRef
     * @param {HTMLCanvasElement | null} node - The canvas element to attach the confetti instance to, or null to clean up.
     */
    const canvasRef = useCallback(
        (node: HTMLCanvasElement) => {
            if (node !== null) {
                if (instanceRef.current) return
                instanceRef.current = confetti.create(node, {
                    ...globalOptions,
                    resize: true,
                })
            } else {
                if (instanceRef.current) {
                    instanceRef.current.reset()
                    instanceRef.current = null
                }
            }
        },
        [globalOptions]
    )

    /**
     * @function fire
     * @param {ConfettiOptions} [opts={}] - Optional confetti options to override defaults.
     * @returns {Promise<void>} A promise that resolves when the confetti animation completes.
     */
    const fire = useCallback(
        async (opts = {}) => {
            try {
                await instanceRef.current?.({ ...options, ...opts })
            } catch (error) {
                console.error("Confetti error:", error)
            }
        },
        [options]
    )

    /**
     * @const {Api} api - Memoized API object containing the fire method, updated when fire changes.
     */
    const api = useMemo(
        () => ({
            fire,
        }),
        [fire]
    )

    useImperativeHandle(ref, () => api, [api])

    useEffect(() => {
        if (!manualstart) {
            ;(async () => {
                try {
                    await fire()
                } catch (error) {
                    console.error("Confetti effect error:", error)
                }
            })()
        }
    }, [manualstart, fire])

    return (
        <ConfettiContext.Provider value={api}>
            <canvas ref={canvasRef} {...rest} />
            {children}
        </ConfettiContext.Provider>
    )
})

// Set display name immediately
ConfettiComponent.displayName = "Confetti"

// Export as Confetti
export const Confetti = ConfettiComponent

/*interface ConfettiButtonProps extends React.ComponentProps<"button"> {
    options?: ConfettiOptions &
        ConfettiGlobalOptions & { canvas?: HTMLCanvasElement }
}

const ConfettiButtonComponent = ({
                                     options,
                                     children,
                                     ...props
                                 }: ConfettiButtonProps) => {
    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        try {
            const rect = event.currentTarget.getBoundingClientRect()
            const x = rect.left + rect.width / 2
            const y = rect.top + rect.height / 2
            await confetti({
                ...options,
                origin: {
                    x: x / window.innerWidth,
                    y: y / window.innerHeight,
                },
            })
        } catch (error) {
            console.error("Confetti button error:", error)
        }
    }
}

ConfettiButtonComponent.displayName = "ConfettiButton"

export const ConfettiButton = ConfettiButtonComponent
*/
