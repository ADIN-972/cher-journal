import React from "react";

function BookClosed({
  className,
  color,
  selected,
}: {
  className?: string;
  color?: string;
  selected?: boolean;
}) {
  return (
    /*  <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={`${className} h-full w-auto [&_#cover-page]:fill-[${color || "#53273f"}] [&_#cover-page-2]:fill-[${color || "#53273f"}]`}
      viewBox="0 0 210 273.714">
      <defs>
        <radialGradient
          id="radial-gradient-closed-book"
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
          id="linear-gradient-closed-book"
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
          id="linear-gradient-2-closed-book"
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
            fill="url(#radial-gradient-closed-book)"
          />
        </g>
        <g
          id="cover"
          data-name="Groupe 18156"
          transform="translate(142.535 45)">
          <rect
            id="Rectangle_6547"
            data-name="Rectangle 6547"
            width="144"
            height="222"
            transform="translate(-15754.535 -11797)"
            fill={color || "#53273f"}
          />
          <g
            id="Rectangle_6548"
            data-name="Rectangle 6548"
            transform="translate(-15758.535 -11794)"
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
            transform="translate(-15759.534 -11798)"
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
            transform="translate(-15762.536 -11800)"
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
            id="cover-page-2"
            data-name="Rectangle 6544"
            d="M5,0H166a2,2,0,0,1,2,2V232a2,2,0,0,1-2,2H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
            transform="translate(-15788.535 -11803)"
            fill={color || "#53273f"}
          />
          <path
            id="Rectangle_6546"
            data-name="Rectangle 6546"
            d="M5,0h8a0,0,0,0,1,0,0V234a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
            transform="translate(-15788.535 -11803)"
            fill="url(#linear-gradient-closed-book)"
          />
          <rect
            id="Rectangle_6545"
            data-name="Rectangle 6545"
            width="12"
            height="234"
            transform="translate(-15775.535 -11803)"
            fill="url(#linear-gradient-2-closed-book)"
          />
        </g>
      </g>
    </svg>
*/
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={`${className} h-full w-auto ${selected ? "" : ""}`}
      viewBox="0 0 210 273.714">
      <defs>
        <radialGradient
          id="radial-gradient-closed-book"
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
          id="linear-gradient-closed-book"
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
          id="linear-gradient-closed-book-2"
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
            fill="url(#radial-gradient-closed-book)"
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
            fill={color || "#53273f"}
          />
          <g
            id="selected-2"
            transform="translate(-15754.535 -11797)"
            strokeWidth="2"
            fill={selected ? color || "#53273f" : "none"}
            stroke={selected ? color || "#53273f" : "none"}
            className={`${selected ? "blur-md" : "hidden"}`}
            >
            <rect
              width="144"
              height="222"
              stroke="none"
            />
            <rect
              x="1"
              y="1"
              width="142"
              height="220"
              fill="none"
            />
          </g>
          <g
            id="Rectangle_6548"
            data-name="Rectangle 6548"
            transform="translate(-15758.535 -11794)"
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
            transform="translate(-15759.534 -11798)"
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
            transform="translate(-15762.536 -11800)"
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
            fill={color || "#53273f"}
          />
          <path
            id="Rectangle_6546"
            data-name="Rectangle 6546"
            d="M5,0h8a0,0,0,0,1,0,0V234a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
            transform="translate(-15788.535 -11803)"
            fill="url(#linear-gradient-closed-book)"
          />
          <rect
            id="Rectangle_6545"
            data-name="Rectangle 6545"
            width="12"
            height="234"
            transform="translate(-15775.535 -11803)"
            fill="url(#linear-gradient-closed-book-2)"
          />
          {/* <g
            id="selected"
            transform="translate(-15788.535 -11803)"
            strokeWidth="3"
            fill={selected ? color || "#53273f" : "none"}
            stroke={selected ? color || "#53273f" : "none"}
            className={`${selected ? "blur-md" : "hidden"}`}>
            <path
              d="M5,0H166a2,2,0,0,1,2,2V232a2,2,0,0,1-2,2H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
              stroke="none"
            />
            <path
              d="M5,1.5H166a.5.5,0,0,1,.5.5V232a.5.5,0,0,1-.5.5H5A3.5,3.5,0,0,1,1.5,229V5A3.5,3.5,0,0,1,5,1.5Z"
              fill="none"
            />
          </g> */}
        </g>
      </g>
    </svg>
  );
}

export default BookClosed;
