export const isMobileBrowser = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)

export const canWebShare = !!navigator.share
