export function WorkshopArt({
  purchases = [],
  hero = false,
}: {
  purchases?: string[];
  hero?: boolean;
}) {
  const wall = hero || purchases.includes("wall"),
    bench = hero || purchases.includes("bench"),
    diagnostics = hero || purchases.includes("diagnostics");
  return (
    <svg
      className="workshop-art"
      viewBox="0 0 600 400"
      role="img"
      aria-label={`Deine Werkstatt mit ${purchases.length} Ausbauten`}
    >
      <defs>
        <linearGradient id={hero ? "floor-h" : "floor"} x2="1" y2="1">
          <stop stopColor="#637e74" />
          <stop offset="1" stopColor="#3d5d53" />
        </linearGradient>
      </defs>
      <ellipse
        cx="305"
        cy="348"
        rx="240"
        ry="32"
        fill="#091c19"
        opacity=".14"
      />
      <path d="M62 135 290 30 535 151 535 292 300 391 62 270Z" fill="#b8c9ac" />
      <path d="M62 135 290 30 290 200 62 302Z" fill="#8ba994" />
      <path d="M290 30 535 151 535 307 290 200Z" fill="#cee0bd" />
      <path
        d="M62 302 290 200 535 307 300 391Z"
        fill={`url(#${hero ? "floor-h" : "floor"})`}
      />
      <path d="M62 302 300 405 535 318 535 307 300 391Z" fill="#243e36" />
      <path
        d="m115 325 230-103m-172 129 230-104m-172 129 231-103M116 278l238 103M174 252l238 106M232 226l238 110"
        fill="none"
        stroke="#adc2a3"
        strokeWidth="1"
        opacity=".25"
      />
      <path d="M83 152 157 118 157 217 83 250Z" fill="#34554b" />
      <path d="M89 155 151 127 151 213 89 240Z" fill="#b5d9cc" />
      <path d="m120 141 0 86m-30-35 61-27" stroke="#355c4f" strokeWidth="5" />
      <path d="M87 242 158 211 167 219 96 253Z" fill="#e5eacb" />
      <path d="M185 96 250 66 250 164 185 193Z" fill="#516f5e" opacity=".65" />
      <path d="M194 104 242 82 242 147 194 169Z" fill="#f1e1b3" />
      <path
        d="m203 114 30-14m-30 29 20-9m-20 25 30-14"
        stroke="#78917c"
        strokeWidth="4"
      />
      <path
        d="M325 69 487 149 487 228 325 150Z"
        fill={wall ? "#567164" : "#abc39f"}
      />
      {wall && (
        <g stroke="#d4e1bd" strokeWidth="5" strokeLinecap="round">
          <path d="m349 102 0 33m-8-40 0 11 16 8 0-11m19 7 0 34m0-29 14 7m15-5 0 35m-7-38 14 7m17 5 0 28m-7-34 14 7m18 5 0 22" />
          <path d="m347 150 115 56" stroke="#334e40" strokeWidth="6" />
        </g>
      )}
      {!wall && (
        <g opacity=".4" stroke="#668374" strokeWidth="2" strokeDasharray="5 5">
          <path d="m345 99 119 59 0 46-119-58Z" fill="none" />
        </g>
      )}
      {bench ? (
        <g>
          <path d="M275 213 324 190 475 259 423 283Z" fill="#edbd78" />
          <path
            d="M275 213 423 283 475 259 475 270 423 294 275 226Z"
            fill="#ba8045"
          />
          <path
            d="M286 230 298 235 298 306 286 300Zm126 57 12 6 0 64-12-6Zm48-13 10-5 0 58-10 5Z"
            fill="#233e35"
          />
          <path d="m299 263 112 52 0 22-112-52Z" fill="#789185" />
          <path d="m316 217 14-7 42 19-15 8Z" fill="#2d4b43" />
          <path d="m358 238 22-10 34 16-23 10Z" fill="#f5efd9" />
        </g>
      ) : (
        <g opacity=".55">
          <path
            d="M287 233 335 212 465 271 420 292Z"
            stroke="#a9b8a0"
            strokeWidth="2"
            strokeDasharray="6 5"
            fill="none"
          />
          <path
            d="m287 233 0 57m133 2 0 53m45-74 0 54"
            stroke="#a9b8a0"
            strokeWidth="2"
            strokeDasharray="6 5"
          />
        </g>
      )}
      {diagnostics && (
        <g>
          <path d="M407 227 407 181 449 201 449 247Z" fill="#203d34" />
          <path d="M413 224 413 191 443 206 443 238Z" fill="#b9e891" />
          <path
            d="m416 214 7-2 6 10 4-10 6 11"
            stroke="#557f54"
            strokeWidth="2"
            fill="none"
          />
          <path d="m425 237 0 12 14 6" stroke="#244337" strokeWidth="5" />
        </g>
      )}
      <g>
        <path d="M111 274 151 256 189 275 150 293Z" fill="#edc184" />
        <path d="m111 274 39 19 0 43-39-19Z" fill="#bd8850" />
        <path d="m150 293 39-18 0 42-39 19Z" fill="#d6a065" />
        <path d="m128 266 39 19 0 15-10 5 0-15-40-18Z" fill="#f1d3a0" />
      </g>
      <g>
        <path d="m222 315 28-13 26 12-28 13Z" fill="#264e3f" />
        <path d="m222 315 5 32 20 10 22-10 7-33-28 13Z" fill="#dcad6e" />
        <path d="m247 320 0-55" stroke="#355d3c" strokeWidth="5" />
        <path
          d="M247 301c-35-5-37-30-21-26 18 6 21 26 21 26m0-18c29-30 38-9 0 16m0-33c-23-28-33-4 0 20"
          fill="#5a8654"
        />
      </g>
      <path
        d="m290 30 245 121M62 135 290 30"
        stroke="#e1e9cd"
        strokeWidth="5"
      />
      <g>
        <path
          d="m303 49 0-27 35 17 0 26"
          fill="none"
          stroke="#35574a"
          strokeWidth="4"
        />
        <path d="m294 23 12-6 42 21-13 7Z" fill="#f1cb85" />
      </g>
    </svg>
  );
}
