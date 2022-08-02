import { Capacitor } from '@capacitor/core'

export const isMobileBrowser = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)

/**
 * @type Boolean
 */
export const isCapacitorNative = Capacitor.isNative

export const canWebShare = !!navigator.share
