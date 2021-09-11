export const EXTERNAL_LINK_REGEX = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/igm
export const BACKLINK_REGEX = />>(\d+)($|\W)/gm
export const BACKLINK_HTML_SAFE_REGEX = /&gt;&gt;(\d+)($|\W)/gm
export const SPOILER_REGEX = /\[spoiler\]((?:.|\s)*?)\[\/spoiler]/gm
export const REF_HTML_SAFE_REGEX = /&gt;&gt;(0[xX][0-9a-fA-F]+)(?!\/)($|\W)/gmi
export const REF_POST_HTML_SAFE_REGEX = /&gt;&gt;((?:0[xX][0-9a-fA-F]+)\/\d+)($|\W)/gmi
export const REF_BOARD_HTML_SAFE_REGEX = /&gt;&gt;(\/(?:[a-zA-Z]+)\/(0[xX][0-9a-fA-F]+(?:\/\d+)?)?)($|\W)/gmi
export const TEXT_QUOTES_HTML_SAFE_REGEX = /^&gt;(?!&gt;)(.*)$/gm
export const NEWLINE_REGEX = /\n/gm
export const IPFS_HASH_REGEX = /(Qm[1-9A-Za-z]{44})/gm