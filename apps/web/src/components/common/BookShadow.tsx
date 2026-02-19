import React from "react";

function BookShadow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className="h-full w-auto blur-sm"
      viewBox="0 0 210 273.714">
      <defs>
        <radialGradient
          id="radial-gradient-shadow"
          cx="0.365"
          cy="0.443"
          r="0.757"
          gradientTransform="matrix(0.082, 0.997, -1.292, 0.107, 0.908, 0.032)"
          gradientUnits="objectBoundingBox">
          <stop
            offset="0"
           stopOpacity="0.361"
          />
          <stop
            offset="0.85"
           stopColor="#070707"
           stopOpacity="0"
          />
          <stop
            offset="1"
           stopColor="#545454"
           stopOpacity="0"
          />
        </radialGradient>
        <linearGradient
          id="linear-gradient-shadow"
          x1="-0.264"
          x2="1"
          gradientUnits="objectBoundingBox">
          <stop
            offset="0"
           stopOpacity="0.502"
          />
          <stop
            offset="1"
           stopOpacity="0"
          />
        </linearGradient>
        <linearGradient
          id="linear-gradient-2-shadow"
          y1="0.552"
          x2="1"
          y2="0.552"
          gradientUnits="objectBoundingBox">
          <stop
            offset="0"
           stopOpacity="0"
          />
          <stop
            offset="0.707"
           stopOpacity="0.439"
          />
          <stop
            offset="1"
           stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <g
        id="Groupe_18159"
        data-name="Groupe 18159"
        transform="translate(15646 11758)">
        <g
          id="Groupe_18158"
          data-name="Groupe 18158">
          <path
            id="Tracé_19083"
            data-name="Tracé 19083"
            d="M-51,0H116.862L155,105.222V264.714H-24.379L-51,225.921Z"
            transform="translate(-15591 -11749)"
            fill="url(#radial-gradient-shadow)"
          />
        </g>
        <g
          id="Groupe_18156"
          data-name="Groupe 18156"
          transform="translate(142.535 45)">
          <rect
            id="Rectangle_6547"
            data-name="Rectangle 6547"
            width="144"
            height="222"
            transform="translate(-15754.535 -11797)"
            fill="#53273f"
          />
          <g
            id="Rectangle_6548"
            data-name="Rectangle 6548"
            transform="translate(-15757.535 -11794)"
            fill="#fff"
            stroke="#d8d8d8"
            strokeWidth="1">
            <rect
              width="145"
              height="217"
              stroke="none"
            />
            <rect
              x="0.5"
              y="0.5"
              width="144"
              height="216"
              fill="none"
            />
          </g>
          <g
            id="Rectangle_6549"
            data-name="Rectangle 6549"
            transform="translate(-15759.535 -11798)"
            fill="#fff"
            stroke="#d8d8d8"
            strokeWidth="1">
            <rect
              width="144"
              height="224"
              stroke="none"
            />
            <rect
              x="0.5"
              y="0.5"
              width="143"
              height="223"
              fill="none"
            />
          </g>
          <g
            id="Rectangle_6550"
            data-name="Rectangle 6550"
            transform="translate(-15762.535 -11800)"
            fill="#fff"
            stroke="#d8d8d8"
            strokeWidth="1">
            <rect
              width="145"
              height="229"
              stroke="none"
            />
            <rect
              x="0.5"
              y="0.5"
              width="144"
              height="228"
              fill="none"
            />
          </g>
          <path
            id="Rectangle_6544"
            data-name="Rectangle 6544"
            d="M5,0H166a2,2,0,0,1,2,2V232a2,2,0,0,1-2,2H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
            transform="translate(-15788.535 -11803)"
            fill="#53273f"
          />
          <path
            id="Rectangle_6546"
            data-name="Rectangle 6546"
            d="M5,0h8a0,0,0,0,1,0,0V234a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
            transform="translate(-15788.535 -11803)"
            fill="url(#linear-gradient-shadow)"
          />
          <rect
            id="Rectangle_6545"
            data-name="Rectangle 6545"
            width="12"
            height="234"
            transform="translate(-15775.535 -11803)"
            fill="url(#linear-gradient-2-shadow)"
          />
        </g>
      </g>
    </svg>
  );
}

export default BookShadow;
