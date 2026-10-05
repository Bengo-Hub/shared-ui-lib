/**
 * THE payment provider brand marks, for every app (treasury-ui pay page and gateway modals,
 * pos-ui payment bar and settle modal). Each mark lives only here, self-contained (inline SVG or
 * an embedded data URI), so no app keeps its own copy or a public/ asset for it.
 *
 * - M-Pesa: Safaricom's mark (Wikimedia Commons, File:M-PESA_LOGO-01.svg). A wide wordmark
 *   (~1.88:1): size the box to that ratio (h-5 w-9), a square box shrinks it to a sliver.
 * - Paystack: the stacked-bars mark and wordmark from Paystack's own site header (paystack.com).
 * - Airtel Money: Airtel's swoosh and wordmark (Wikimedia Commons, File:Bharti_Airtel_Logo.svg).
 * - MTN MoMo: MTN's yellow square and blue oval (Wikimedia Commons, File:MTN_Logo.svg).
 * - PayHero: PayHero publishes its logo only as PNG (payherokenya.com, docs.payhero.co.ke), so the
 *   "PH" circles are its official artwork embedded as a 160x90 PNG data URI (also ~1.8:1 wide).
 * - Cash, card and Multiple Pay: our own marks (CashMark, CardMark, SplitPayMark) in PayHero's
 *   disc style, for tender buttons.
 *
 * Marks that carry the name (M-Pesa, Airtel, MTN, PayHero, the Paystack wordmark) need no text
 * label beside them; give the button an aria-label instead.
 */
import type { CSSProperties } from 'react';

interface LogoProps {
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function AirtelMoneyLogo({ className, style, title = 'Airtel Money' }: LogoProps) {
  return (
    <svg viewBox="0 0 724.26 729.61" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <g transform="matrix(0.1,0,0,-0.1,-86.672636,774.61335)" fill="#ff0000">
        <path d="m 4880,7740 c -14,-4 -47,-8 -73,-9 -104,-2 -440,-87 -562,-141 -11,-5 -42,-18 -70,-29 -73,-28 -266,-120 -296,-142 -14,-9 -37,-21 -52,-24 -15,-4 -27,-11 -27,-15 0,-4 -8,-10 -17,-14 -10,-3 -31,-15 -48,-26 -16,-11 -40,-24 -53,-30 -13,-5 -38,-21 -56,-35 -18,-14 -36,-25 -39,-25 -23,0 -345,-234 -436,-316 -74,-67 -211,-213 -211,-225 0,-3 -9,-17 -21,-30 -30,-34 -120,-176 -146,-229 -11,-25 -33,-69 -47,-99 -49,-100 -69,-209 -64,-336 6,-125 34,-190 119,-276 89,-89 184,-128 334,-136 103,-5 177,3 280,32 33,9 77,20 98,26 21,5 45,13 55,19 23,12 152,70 158,70 18,0 229,129 424,259 129,86 242,161 252,166 9,6 70,42 135,81 65,38 145,84 178,101 33,17 80,42 105,55 25,12 72,34 105,46 33,13 74,30 90,37 17,7 41,18 55,24 39,16 127,32 213,38 186,12 316,-70 383,-242 16,-41 19,-75 19,-195 0,-146 -13,-226 -52,-320 -8,-19 -19,-46 -25,-60 -50,-120 -153,-292 -271,-448 -112,-150 -353,-399 -512,-530 -55,-46 -116,-96 -135,-112 -42,-35 -91,-70 -145,-106 -22,-14 -58,-38 -80,-54 -62,-42 -227,-130 -320,-170 -27,-12 -64,-28 -82,-36 -17,-8 -40,-14 -51,-14 -10,0 -33,-5 -51,-11 -65,-23 -131,21 -131,88 0,82 39,134 285,378 266,264 295,303 295,403 0,103 -49,173 -159,229 -48,25 -66,28 -150,28 -98,0 -155,-14 -226,-57 -16,-10 -41,-23 -55,-30 -14,-7 -27,-15 -30,-18 -3,-3 -23,-18 -45,-35 -53,-40 -146,-135 -199,-204 -37,-48 -64,-93 -127,-211 -52,-98 -99,-280 -99,-386 0,-215 112,-387 285,-436 52,-15 264,-15 337,-1 72,15 260,73 272,84 6,5 16,9 24,9 26,0 323,151 425,217 23,15 49,32 59,38 9,5 56,34 105,64 48,30 90,58 93,61 3,4 37,29 75,55 39,27 84,58 100,69 17,12 64,48 105,81 260,207 490,428 624,600 22,27 42,52 45,55 8,6 76,104 123,178 21,31 53,86 71,122 19,36 45,85 58,110 13,25 41,90 63,145 21,55 42,109 46,120 28,71 71,254 90,385 21,148 5,391 -36,525 -17,55 -21,65 -58,145 -80,172 -208,328 -355,430 -20,14 -45,33 -56,44 -36,32 -219,114 -326,145 -57,17 -142,35 -189,42 -108,14 -367,21 -400,9 z" />
        <path d="m 7779,2795 c -3,-2 -49,-11 -104,-20 -55,-8 -145,-23 -200,-33 l -100,-17 v -920 c 0,-999 -2,-957 57,-1082 20,-43 48,-80 91,-119 106,-97 205,-127 416,-128 180,0 173,-7 169,159 l -3,120 -77,7 c -137,12 -203,67 -218,181 -4,34 -7,462 -6,950 1,845 -1,926 -25,902 z" />
        <path d="m 5010,2775 c -222,-33 -296,-47 -305,-58 -7,-8 -8,-327 -5,-937 5,-852 7,-929 23,-970 38,-97 58,-131 109,-182 105,-105 239,-148 459,-148 122,0 139,2 147,18 10,19 15,193 7,233 -6,25 -10,26 -85,32 -95,6 -151,38 -190,107 l -25,45 -3,518 c -2,386 0,522 9,533 9,11 43,14 150,14 165,0 151,-16 147,175 l -3,130 -140,5 c -77,3 -146,9 -152,13 -10,6 -13,67 -13,248 v 239 l -22,-1 c -13,-1 -61,-7 -108,-14 z" />
        <path d="m 1545,2324 c -75,-7 -255,-50 -310,-74 -11,-5 -31,-12 -45,-16 -44,-12 -190,-85 -190,-95 0,-5 9,-28 19,-52 66,-145 91,-197 96,-197 3,0 13,4 23,9 51,26 113,51 162,66 30,9 66,21 80,26 56,20 205,30 274,19 136,-22 186,-85 194,-246 4,-89 4,-91 -19,-97 -13,-4 -105,-7 -204,-7 -238,0 -311,-14 -465,-89 -132,-64 -230,-185 -277,-341 -24,-83 -21,-238 6,-320 90,-272 304,-431 602,-447 271,-15 550,66 729,210 l 65,53 3,529 c 3,613 2,634 -72,784 -33,68 -144,176 -213,206 -32,15 -67,30 -78,35 -75,33 -265,55 -380,44 z m 295,-964 c 6,-8 10,-127 10,-271 0,-284 4,-266 -70,-305 -28,-15 -59,-18 -156,-19 h -121 l -50,34 c -27,18 -59,48 -70,65 -74,108 -69,301 9,396 23,29 111,90 127,90 10,0 21,4 27,9 14,15 60,19 177,17 84,-1 110,-4 117,-16 z" />
        <path d="m 4040,2300 c -199,-47 -358,-132 -518,-278 l -42,-38 v -730 c 0,-401 0,-737 0,-747 0,-16 15,-17 218,-15 l 217,3 3,697 2,696 38,30 c 45,36 67,47 125,67 69,23 177,34 258,25 40,-4 78,-6 84,-3 7,2 25,36 41,76 15,40 39,92 51,116 33,63 30,79 -14,89 -21,5 -59,14 -86,20 -71,18 -288,13 -377,-8 z" />
        <path d="m 6215,2298 c -33,-5 -64,-14 -69,-19 -6,-5 -16,-9 -24,-9 -8,0 -44,-14 -79,-32 -77,-38 -195,-147 -245,-228 -44,-71 -95,-177 -103,-215 -4,-16 -10,-39 -15,-50 -4,-11 -16,-54 -26,-95 -27,-108 -27,-454 -1,-555 24,-93 78,-235 88,-235 5,0 9,-5 9,-11 0,-38 119,-189 203,-257 37,-30 120,-73 182,-94 67,-23 215,-48 281,-48 142,0 398,61 483,115 20,12 47,26 61,30 30,9 96,50 104,64 9,14 -103,241 -118,241 -7,0 -25,-9 -39,-20 -14,-11 -31,-20 -39,-20 -7,0 -22,-6 -33,-14 -11,-7 -63,-28 -115,-46 -89,-31 -104,-33 -235,-34 -124,0 -145,2 -185,21 -140,67 -220,236 -220,464 0,49 1,90 3,91 1,2 223,5 492,8 l 490,5 -3,100 c -6,196 -58,460 -103,520 -4,6 -18,31 -31,56 -54,107 -168,199 -303,244 -99,34 -280,44 -410,23 z m 215,-318 c 42,-11 130,-82 130,-104 0,-6 7,-24 15,-39 23,-45 41,-193 25,-212 -10,-13 -49,-15 -251,-15 h -239 l -6,25 c -13,51 22,188 62,241 44,59 83,89 141,106 32,9 63,15 70,13 6,-2 30,-9 53,-15 z" />
        <path d="m 2770,3002 c -76,-39 -99,-58 -132,-107 -32,-49 -33,-53 -33,-155 v -106 l 38,-52 c 45,-61 75,-83 141,-106 89,-29 166,-18 255,38 107,68 144,242 79,370 -23,45 -43,66 -103,104 -54,35 -191,43 -245,14 z" />
        <path d="m 3015,2280 c -16,-5 -61,-14 -100,-19 -38,-5 -108,-15 -155,-22 -47,-6 -88,-15 -93,-18 -9,-8 -10,-1707 -2,-1722 4,-5 93,-9 210,-9 204,0 205,0 210,23 3,12 4,416 3,897 -3,867 -3,875 -23,877 -11,1 -33,-2 -50,-7 z" />
      </g>
    </svg>
  );
}

export function MtnMomoLogo({ className, style, title = 'MTN MoMo' }: LogoProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="200" height="200" fill="#FFFFFF" />
      <rect x="9.75" y="9.73" width="180.52" height="180.52" fill="#FFCB05" />
      <path fill="#00678F" d="M184.62,99.47c0,19.27-37.88,34.89-84.6,34.89c-46.73,0-84.61-15.62-84.61-34.89s37.88-34.88,84.61-34.88C146.74,64.59,184.62,80.2,184.62,99.47" />
      <polygon fill="#FFFFFF" points="45.81,116.69 54.56,81.8 68.54,81.8 68.54,102.12 77.73,81.8 92.16,81.8 83.42,116.69 74.23,116.69 79.47,94.17 68.54,116.69 61.12,116.69 61.12,94.17 55.42,116.69" />
      <polygon fill="#ED1D24" points="94.99,117.13 96.3,112.27 106.36,112.27 105.04,117.13" />
      <polygon fill="#FFFFFF" points="117.5,116.69 126.24,81.8 136.3,81.8 140.68,100.36 145.48,81.8 154.66,81.8 145.92,116.69 136.3,116.69 131.49,97.7 126.68,116.69" />
      <polygon fill="#FFCB05" points="94.99,81.8 92.8,90.64 101.99,90.64 97.04,109.81 107.09,109.81 112.05,90.64 121.23,90.64 123.41,81.8" />
    </svg>
  );
}

export function MpesaLogo({ className, style, title = 'M-Pesa' }: LogoProps) {
  return (
    <svg viewBox="0 0 512 273" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <path fill="#39b54a" stroke="#39b54a" strokeWidth="2" d="m361 184c-6.68-1.88-14.8-5.54-19.9-8.94-1.52-1.02-1.180-2.66 1.73-8.42l3.62-7.15 9.09 4.74c15.9 8.33 29 7.71 29-1.4 0-4.39-3.64-6.710-16.4-10.4-17.5-5.12-25.4-13.2-24.1-24.4 1.71-14 12.7-21.4 31.2-21.3 10.9 0.114 26.2 4.19 28.2 7.54 0.754 1.220-4.68 15.5-5.89 15.5-0.323 0-2.95-1.18-5.82-2.62-13.7-6.88-27.1-6.75-27.1 0.259 0 4.67 3.4 7.15 14.8 10.8 14.8 4.79 20 8.11 23.4 15.1 3.36 6.94 2.86 14-1.48 21.2-5.65 9.29-25.2 13.9-40.6 9.62zm-351-38.1v-38.8h21.2l11.3 22.6c6.22 12.4 11.6 22.6 12 22.6s5.77-10.2 12-22.6l11.3-22.6h21.2v77.6h-16.9v-24c0-13.2-0.486-24-1.08-24-0.595 0-5.3 8.88-10.5 19.7l-9.38 19.7h-13.1l-20.3-41.6-0.77 50.1h-16.9zm188-0.203v-38.9l21.7 0.73c18.6 0.626 22.7 1.18 28.2 3.85 9.45 4.57 12.7 9.93 13.3 21.9 0.942 19.9-8.5 28.6-32.1 30l-12.7 0.725v20.7h-18.3zm41.7-0.948c3.02-2.59 3.79-4.5 3.79-9.29 0-9.26-3.54-11.9-16.6-12.6l-10.6-0.533v25.7h9.79c8.21 0 10.4-0.53 13.6-3.27zm31.6 1.15v-38.8h59.2v15.5h-40.9v15.5h38.1v15.5h-38.1v15.5h42.3v15.5h-60.6zm142 30.7c1.93-4.5 9.38-21.9 16.5-38.5l13-30.3 19.7-0.805 15.1 36.4c8.32 20 15.5 37.5 16.1 38.9 0.83 2.31 0.0141 2.5-9.31 2.12l-10.2-0.417-4.68-12.7h-34.8l-4.95 12.7-20 0.828zm49.6-21.9c-6.36-17.3-10.1-26.4-10.8-26.4-0.478 7e-3 -3.09 5.84-5.81 13-2.71 7.12-5.15 13.5-5.4 14.1-0.258 0.625 4.72 1.14 11.1 1.14 8.64 0 11.4-0.443 10.9-1.76z" />
      <path fill="#d8e3d2" fillRule="evenodd" d="m172 80.6v9.36c-15.2 0.0524-30.2 0.0158-45.3 0.0158-12.9 0-14.4 6.09-14.4 15.7v131c0 7.81 6.44 14.1 14.4 14.1h43.1c7.99 0 14.4-6.29 14.4-14.1v-157c0-1.97-1.59-5.95-5.39-5.77-4.27 0.237-6.78 3.37-6.91 5.770zm-37.1 27.1h27.6c11.6 0 13.2 7.25 13.2 15.1v46.7c0 5.8-5.03 14.9-13.2 14.9h-27.6c-9.97 0-15.2-8.6-15.2-14.9v-46.7c0-7.81 4.13-15.1 15.2-15.1z" />
      <path fill="#9d4c44" fillRule="evenodd" d="m104 155c9.07-0.942 17.2-5.6 26.4-17.6 10.4 15.8 24.7 15.2 39.2 16.8-15.6 0.163-13.6 5.52-34.8 4.03-6.77-0.473-17.9-0.936-30.7-3.19z" />
      <path fill="#ed1c24" fillRule="evenodd" d="m161 122 33.8 16.4c-24.1 26.9-58.5 25.1-90.2 16.8 17.5-0.0728 33 6.4 56.3-33.1z" />
    </svg>
  );
}

export interface PaystackLogoProps extends LogoProps {
  /** Include the "paystack" wordmark beside the mark (default: the mark alone). */
  wordmark?: boolean;
}

const PAYSTACK_MARK = 'M22.32 2.663H1.306C.594 2.663 0 3.263 0 3.985v2.37c0 .74.594 1.324 1.307 1.324h21.012c.73 0 1.307-.602 1.324-1.323V4.002c0-.738-.594-1.34-1.323-1.34zm0 13.192H1.306a1.3 1.3 0 00-.924.388 1.33 1.33 0 00-.383.935v2.37c0 .74.594 1.323 1.307 1.323h21.012c.73 0 1.307-.584 1.324-1.322v-2.371c0-.739-.594-1.323-1.323-1.323zm-9.183 6.58H1.307c-.347 0-.68.139-.924.387a1.33 1.33 0 00-.383.935v2.37c0 .74.594 1.323 1.307 1.323H13.12c.73 0 1.307-.6 1.307-1.322v-2.371a1.29 1.29 0 00-1.29-1.323zM23.643 9.258H1.307c-.347 0-.68.14-.924.387a1.33 1.33 0 00-.383.936v2.37c0 .739.594 1.323 1.307 1.323h22.32c.73 0 1.306-.601 1.306-1.323v-2.37a1.301 1.301 0 00-1.29-1.323z';
const PAYSTACK_WORDMARK = 'M48.101 8.005a6.927 6.927 0 00-2.274-1.563 7.041 7.041 0 00-2.716-.55 5.767 5.767 0 00-2.63.567c-.55.263-1.046.63-1.46 1.082V7.13a.876.876 0 00-.22-.567.721.721 0 00-.56-.258h-2.937a.697.697 0 00-.56.258.796.796 0 00-.221.567v19.566c0 .206.085.412.22.566a.776.776 0 00.56.224h2.971c.204 0 .39-.086.543-.224a.7.7 0 00.238-.566v-6.683c.424.464.967.808 1.561 1.014.781.292 1.596.43 2.427.43.95 0 1.884-.173 2.75-.55a6.859 6.859 0 002.308-1.58 7.45 7.45 0 001.562-2.457 8.34 8.34 0 00.577-3.213 8.761 8.761 0 00-.577-3.229A7.775 7.775 0 0048.1 8.005zm-2.681 7.077a3.33 3.33 0 01-.696 1.117 3.177 3.177 0 01-2.36 1.013c-.458 0-.899-.086-1.306-.275a3.324 3.324 0 01-1.07-.738 3.673 3.673 0 01-.713-1.117 3.837 3.837 0 010-2.748c.153-.412.408-.79.713-1.1a3.576 3.576 0 011.07-.755 2.888 2.888 0 011.306-.275c.459 0 .9.086 1.324.274.39.19.747.43 1.053.74.305.326.526.686.696 1.099a3.976 3.976 0 01-.017 2.765zm20.808-8.778h-2.953a.728.728 0 00-.543.24.823.823 0 00-.237.585v.36a4.143 4.143 0 00-1.341-1.03 5.652 5.652 0 00-2.58-.567 7.222 7.222 0 00-5.075 2.096 7.733 7.733 0 00-1.63 2.456 8.036 8.036 0 00-.61 3.23 8.15 8.15 0 00.61 3.23 7.880 7.880 0 001.613 2.456 6.959 6.959 0 005.058 2.112c.9.018 1.782-.171 2.597-.567.509-.257.984-.6 1.358-1.03v.395c0 .206.084.412.237.567.153.137.34.223.543.223h2.953a.855.855 0 00.56-.223.768.768 0 00.221-.567V7.129a.796.796 0 00-.22-.567.697.697 0 00-.56-.258zm-3.988 8.761a3.33 3.33 0 01-.696 1.117 3.83 3.83 0 01-1.052.755c-.832.378-1.8.378-2.631 0a3.575 3.575 0 01-1.07-.755 3.326 3.326 0 01-.695-1.117 3.976 3.976 0 010-2.731c.152-.412.39-.773.696-1.1.305-.309.661-.566 1.069-.755a3.194 3.194 0 012.630 0c.391.189.748.429 1.053.738.289.327.526.687.696 1.1.34.893.34 1.872 0 2.748zm33.437-1.77a4.794 4.794 0 00-1.443-.875 10.054 10.054 0 00-1.731-.516l-2.258-.446c-.577-.103-.984-.258-1.205-.447a.712.712 0 01-.305-.567c0-.24.136-.446.424-.618.39-.206.815-.31 1.256-.275.577 0 1.154.12 1.68.343.51.224 1.019.482 1.477.79.662.413 1.222.344 1.612-.12l1.087-1.236c.203-.207.322-.481.34-.773a1.06 1.06 0 00-.408-.773c-.459-.395-1.188-.825-2.156-1.237-.967-.412-2.190-.636-3.632-.636a8.343 8.343 0 00-2.597.378 6.273 6.273 0 00-1.986 1.03 4.552 4.552 0 00-1.273 1.564 4.417 4.417 0 00-.441 1.907c0 1.22.373 2.216 1.103 2.954.73.739 1.698 1.22 2.903 1.46l2.342.516c.51.086 1.018.24 1.494.464.254.103.424.36.424.652 0 .258-.136.498-.424.705-.289.206-.764.343-1.375.343a4.051 4.051 0 01-1.85-.412 6.792 6.792 0 01-1.51-.996 2.037 2.037 0 00-.68-.378c-.271-.086-.594 0-.95.292l-1.29.979a1.147 1.147 0 00-.458 1.134c.067.43.424.858 1.086 1.357a9.543 9.543 0 005.516 1.632 8.993 8.993 0 002.699-.378 6.830 6.830 0 002.087-1.048c.56-.43 1.036-.98 1.358-1.615a4.543 4.543 0 00.475-2.01 4.168 4.168 0 00-.373-1.82 4.638 4.638 0 00-1.018-1.323zm12.899 3.574a.857.857 0 00-.645-.43c-.271 0-.543.086-.764.24a2.43 2.43 0 01-1.205.396c-.136 0-.288-.017-.424-.052a.777.777 0 01-.39-.206 1.43 1.43 0 01-.323-.446 2.092 2.092 0 01-.136-.79v-5.36h3.836a.86.86 0 00.594-.258.77.77 0 00.255-.567V7.13a.773.773 0 00-.255-.584.833.833 0 00-.577-.24h-3.836v-3.66a.736.736 0 00-.237-.584.814.814 0 00-.544-.223h-2.987a.817.817 0 00-.577.223.838.838 0 00-.254.584v3.66h-1.698a.697.697 0 00-.56.257.876.876 0 00-.22.567v2.267c0 .206.084.413.22.567a.65.65 0 00.56.258h1.698v6.373a5.140 5.140 0 00.441 2.199 4.575 4.575 0 001.137 1.477c.475.395 1.035.67 1.612.842a6.125 6.125 0 001.851.275 7.73 7.73 0 002.427-.396 4.802 4.802 0 001.918-1.202.999.999 0 00.101-1.271l-1.018-1.65zm16.175-10.565h-2.953a.728.728 0 00-.543.24.822.822 0 00-.238.585v.36a4.13 4.13 0 00-1.341-1.03 5.670 5.670 0 00-2.596-.567 7.152 7.152 0 00-5.058 2.096 7.468 7.468 0 00-1.63 2.456 8.017 8.017 0 00-.611 3.212 8.156 8.156 0 00.611 3.23c.374.91.934 1.752 1.613 2.456a7.006 7.006 0 005.041 2.13 5.884 5.884 0 002.596-.55c.51-.257.985-.6 1.358-1.03v.378c.002.21.084.41.23.557a.783.783 0 00.551.233h2.970a.78.78 0 00.781-.773V7.13a.795.795 0 00-.221-.567.696.696 0 00-.56-.258zm-3.988 8.761a3.34 3.34 0 01-.696 1.117 3.83 3.83 0 01-1.053.755 2.907 2.907 0 01-1.323.275c-.459 0-.9-.103-1.307-.275a3.576 3.576 0 01-1.070-.755 3.34 3.34 0 01-.696-1.117 3.982 3.982 0 010-2.731 3.27 3.27 0 01.696-1.1c.306-.309.662-.566 1.070-.755a3.077 3.077 0 011.307-.275c.458 0 .899.086 1.323.274.391.19.747.43 1.053.74.305.326.543.686.696 1.099a3.67 3.67 0 010 2.748zm20.198 1.615l-1.698-1.306c-.322-.257-.628-.326-.899-.223a1.82 1.82 0 00-.628.447 6.03 6.03 0 01-1.29 1.168c-.509.292-1.07.43-1.647.395a3.165 3.165 0 01-1.855-.575 3.224 3.224 0 01-1.183-1.555 4.046 4.046 0 01-.237-1.34c0-.464.067-.928.237-1.374.153-.413.374-.79.679-1.1.306-.309.662-.567 1.052-.739a3.175 3.175 0 011.324-.291 3.06 3.06 0 011.647.412 5.610 5.610 0 011.290 1.168c.169.189.373.343.611.447.271.103.577.034.882-.224l1.698-1.288c.203-.138.373-.344.441-.584a.923.923 0 00-.068-.79 7.35 7.35 0 00-2.614-2.457c-1.12-.635-2.461-.962-3.955-.962a8.163 8.163 0 00-3.072.601 7.650 7.650 0 00-2.495 1.65 7.357 7.357 0 00-1.663 2.473 8.154 8.154 0 000 6.133c.39.927.95 1.769 1.663 2.456a7.876 7.876 0 005.567 2.25c1.494 0 2.835-.326 3.955-.962a7.307 7.307 0 002.631-2.473.886.886 0 00.068-.773 1.167 1.167 0 00-.441-.584zm15.716 3.057l-4.667-6.854 3.989-5.273a.978.978 0 00.169-.86c-.068-.205-.254-.429-.746-.429h-3.157a1.39 1.39 0 00-.527.12 1.058 1.058 0 00-.458.447l-3.191 4.467h-.764V.79a.794.794 0 00-.22-.567.78.78 0 00-.56-.223h-2.954a.856.856 0 00-.56.223.72.72 0 00-.237.567v19.48c0 .223.084.43.237.567a.778.778 0 00.56.223h2.954a.856.856 0 00.56-.223.794.794 0 00.22-.567v-5.153h.849l3.479 5.342c.204.378.595.618 1.019.618h3.310c.509 0 .712-.24.797-.446a.933.933 0 00-.102-.894zM83.015 6.304h-3.310a.852.852 0 00-.662.258 1.178 1.178 0 00-.305.55l-2.445 9.104H75.7l-2.613-9.104a1.54 1.54 0 00-.255-.533.756.756 0 00-.594-.275h-3.429c-.44 0-.712.138-.831.43-.085.257-.085.55 0 .807l4.192 12.798c.068.189.17.378.323.515.17.155.39.24.627.223h1.766l-.153.413-.39 1.185c-.12.36-.34.687-.645.927a1.58 1.58 0 01-.985.327c-.305 0-.61-.069-.882-.19a3.618 3.618 0 01-.781-.463 1.29 1.29 0 00-.747-.24h-.034a.908.908 0 00-.747.463l-1.052 1.546c-.424.67-.187 1.1.085 1.34a5.36 5.36 0 001.952 1.151 7.679 7.679 0 002.495.412c1.51 0 2.783-.412 3.75-1.236a7.067 7.067 0 002.122-3.333l4.855-15.838c.102-.275.119-.567.017-.842-.085-.189-.272-.395-.73-.395z';

export function PaystackLogo({ className, style, title = 'Paystack', wordmark = false }: PaystackLogoProps) {
  return (
    <svg viewBox={wordmark ? '0 0 157 28' : '0 0 25 28'} className={className} style={style} role="img" aria-label={title} fill="none">
      <title>{title}</title>
      <path d={PAYSTACK_MARK} fill="#00C3F7" />
      {wordmark && <path d={PAYSTACK_WORDMARK} fill="#011B33" />}
    </svg>
  );
}

// ─── Tender marks ───────────────────────────────────────────────────────────────────────────────
// Cash, card and split payment have no brand, so they get marks in the same style as PayHero's
// circles: a solid disc with a white glyph, so a row of tenders reads as one set.

export function CashMark({ className, style, title = 'Cash' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="16" cy="16" r="16" fill="#059669" />
      <rect x="6.5" y="10.5" width="19" height="11" rx="2" fill="#fff" />
      <circle cx="16" cy="16" r="2.9" fill="#059669" />
      <circle cx="9.6" cy="16" r="1" fill="#059669" />
      <circle cx="22.4" cy="16" r="1" fill="#059669" />
    </svg>
  );
}

export function CardMark({ className, style, title = 'Card' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="16" cy="16" r="16" fill="#2563EB" />
      <rect x="6.5" y="9.5" width="19" height="13" rx="2" fill="#fff" />
      <rect x="6.5" y="12.2" width="19" height="2.6" fill="#1E3A8A" />
      <rect x="9" y="17.6" width="6" height="2" rx="1" fill="#93C5FD" />
    </svg>
  );
}

/** Multiple Pay: one bill split into parts, each paid with its own tender. */
export function SplitPayMark({ className, style, title = 'Multiple Pay' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="16" cy="16" r="16" fill="#7C3AED" />
      <rect x="7" y="9" width="8" height="14" rx="1.6" fill="#fff" />
      <rect x="17" y="9" width="8" height="14" rx="1.6" fill="#fff" />
      <rect x="9" y="12" width="4" height="1.6" rx=".8" fill="#C4B5FD" />
      <rect x="9" y="15.2" width="4" height="1.6" rx=".8" fill="#C4B5FD" />
      <rect x="19" y="12" width="4" height="1.6" rx=".8" fill="#C4B5FD" />
      <rect x="19" y="15.2" width="4" height="1.6" rx=".8" fill="#C4B5FD" />
    </svg>
  );
}

// PayHero's official "PH" circles (from its published PNG artwork; PayHero has no SVG).
const PAYHERO_MARK_PNG =
  'data:image/png;base64,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';

export function PayHeroLogo({ className, style, title = 'PayHero' }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={PAYHERO_MARK_PNG} alt={title} className={className} style={{ objectFit: 'contain', ...style }} draggable={false} />
  );
}
