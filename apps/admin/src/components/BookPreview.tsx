import React from "react";

function BookPreview({
  type = "square",
  imageSrc,
  title,
  isopen = false,
}: {
  type?: "square" | "portrait";
  imageSrc?: string;
  title: string;
  isopen?: boolean;
}) {
  return (
    <div className="relative">
      {imageSrc ? (
        <img
          src={`${imageSrc}`}
          width="156"
          height="156"
          className={`absolute flex items-center justify-center   ${
            type === "portrait"
              ? isopen
                ? " top-[19px] left-[8px] w-[160px] h-[276px]" //portrait ouvert
                : "left-[18px] w-[162px] h-[236px]" //portrait fermé
              : isopen
                ? "left-[6px] top-[13px] w-[164px] h-[164px]" //carré ouvert
                : "left-[19px] w-[162px] h-[162px]" // carré fermé
          }`}
        />
      ) : (
        <div
          className={`absolute flex items-center justify-center  border border-gray-200 bg-gray-100 ${
            type === "portrait"
              ? isopen
                ? " top-[19px] left-[8px] w-[160px] h-[276px]"
                : "left-[18px] w-[162px] h-[236px]"
              : isopen
                ? "left-[7px] top-[13px] w-[163px] h-[163px]"
                : "left-[19px] w-[162px] h-[162px]"
          }`}>
          <span className="text-2xl text-gray-600 font-bold">N/A</span>
        </div>
      )}
      <div
        className={`absolute bg-gradient-to-r from-black/0 to-black/30 opacity-25 ${
          type === "portrait"
            ? isopen
              ? "left-[150px] top-[13px] w-[20px] h-[287px]"
              : "left-[0px] w-[20px] h-[236px]"
            : isopen
              ? "left-[150px] top-[13px] w-[20px] h-[163px]"
              : "left-[0px] w-[20px] h-[162px]"
        }`}></div>

      {type === "portrait" && !isopen ? ( // portrait fermé
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="235"
          height="247"
          viewBox="0 0 235 247">
          <defs>
            <clipPath id="clip-path">
              <rect
                id="cover"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </clipPath>
            <linearGradient
              id="linear-gradient"
              y1="0.417"
              x2="0.887"
              y2="0.417"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopOpacity="0"
              />
              <stop
                offset="1"
                stopOpacity="0.439"
              />
            </linearGradient>
          </defs>
          <g
            id="Groupe_18155"
            data-name="Groupe 18155"
            transform="translate(16943.231 12426)">
            <rect
              id="back-for-blur"
              width="235"
              height="247"
              transform="translate(-16943.23 -12426)"
              fill="#fff"
              opacity="0"
            />
            <g id="shadow">
              <path
                id="Tracé_19030"
                data-name="Tracé 19030"
                d="M-16543.105-12383.248l16.922,176.853-28.113,14.753a21.749,21.749,0,0,1-5.4,1.739,53.809,53.809,0,0,1-7.43.688l-146.811-35.408s94.848-183.842,93.52-183.842h60.721Z"
                transform="translate(-201.357 -0.533)"
                opacity="0.35"
                className="blur-sm"
              />
              <path
                id="Tracé_19031"
                data-name="Tracé 19031"
                d="M-16526.186-12223.821l-28.113,14.753a21.749,21.749,0,0,1-5.4,1.739,53.809,53.809,0,0,1-7.43.688l-53.291-2.912v-14.268Z"
                transform="translate(-201.355 16.893)"
                opacity="0.65"
                className="blur-sm"
              />
            </g>
            <path
              id="Rectangle_6539"
              data-name="Rectangle 6539"
              d="M5,0H162a0,0,0,0,1,0,0V222a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
              transform="translate(-16916.23 -12417)"
              fill="#53273f"
            />
            <g
              id="Rectangle_6536"
              data-name="Rectangle 6536"
              transform="translate(-16774.23 -12415)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="218"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="217"
                fill="none"
              />
            </g>
            <g
              id="Rectangle_6537"
              data-name="Rectangle 6537"
              transform="translate(-16776.23 -12417)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="222"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="221"
                fill="none"
              />
            </g>
            <g
              id="Rectangle_6538"
              data-name="Rectangle 6538"
              transform="translate(-16778.23 -12419)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="226"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="225"
                fill="none"
              />
            </g>
            <path
              id="Rectangle_6535"
              data-name="Rectangle 6535"
              d="M5,0H180a0,0,0,0,1,0,0V236a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
              transform="translate(-16943.23 -12426)"
              fill="#53273f"
            />
            <g
              id="Groupe_de_masques_7"
              data-name="Groupe de masques 7"
              transform="translate(2710.769 758)"
              clipPath="url(#clip-path)">
              <rect
                id="image"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </g>
            <rect
              id="Rectangle_6540"
              data-name="Rectangle 6540"
              width="15"
              height="236"
              transform="translate(-16940.23 -12426)"
              fill="url(#linear-gradient)"
            />
          </g>
        </svg>
      ) : type === "square" && !isopen ? ( // carré fermé
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="236"
          height="176"
          viewBox="0 0 236 176">
          <defs>
            <clipPath id="clip-path">
              <rect
                id="cover"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </clipPath>
            <linearGradient
              id="linear-gradient"
              y1="0.417"
              x2="0.887"
              y2="0.417"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopOpacity="0"
              />
              <stop
                offset="1"
                stopOpacity="0.439"
              />
            </linearGradient>
          </defs>
          <g
            id="Groupe_18153"
            data-name="Groupe 18153"
            transform="translate(16944.231 12426)">
            <rect
              id="back-for-blur"
              width="235"
              height="176"
              transform="translate(-16943.23 -12426)"
              fill="#fff"
              opacity="0"
            />
            <g id="shadow">
              <path
                id="Tracé_19030"
                data-name="Tracé 19030"
                d="M-16543.105-12391.788l16.922,116.96-28.113,9.756a29.894,29.894,0,0,1-5.4,1.15c-3.205.4-7.43.455-7.43.455l-137.285-20.513s85.322-124.485,83.994-124.485h60.721Z"
                transform="translate(-201.358 -0.534)"
                opacity="0.35"
                className="blur-sm"
              />
              <path
                id="Tracé_19031"
                data-name="Tracé 19031"
                d="M-16526.186-12223.821l-28.113,14.753a21.749,21.749,0,0,1-5.4,1.739,53.809,53.809,0,0,1-7.43.688l-53.291-2.912v-14.268Z"
                transform="translate(-201.356 -57.359)"
                opacity="0.65"
                className="blur-sm"
              />
            </g>
            <path
              id="Rectangle_6539"
              data-name="Rectangle 6539"
              d="M5,0H162a0,0,0,0,1,0,0V148a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
              transform="translate(-16916.23 -12417)"
              fill="#53273f"
            />
            <g
              id="Rectangle_6536"
              data-name="Rectangle 6536"
              transform="translate(-16774.23 -12415)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="144"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="143"
                fill="none"
              />
            </g>
            <g
              id="Rectangle_6537"
              data-name="Rectangle 6537"
              transform="translate(-16776.23 -12417)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="148"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="147"
                fill="none"
              />
            </g>
            <g
              id="Rectangle_6538"
              data-name="Rectangle 6538"
              transform="translate(-16778.23 -12419)"
              fill="#fff"
              stroke="#707070"
              strokeWidth="1">
              <rect
                width="17"
                height="152"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="16"
                height="151"
                fill="none"
              />
            </g>
            <path
              id="Rectangle_6535"
              data-name="Rectangle 6535"
              d="M5,0H181a0,0,0,0,1,0,0V162a0,0,0,0,1,0,0H5a5,5,0,0,1-5-5V5A5,5,0,0,1,5,0Z"
              transform="translate(-16944.23 -12426)"
              fill="#53273f"
            />
            <g
              id="Groupe_de_masques_7"
              data-name="Groupe de masques 7"
              transform="translate(2710.769 758)"
              clipPath="url(#clip-path)">
              <rect
                id="image"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </g>
            <rect
              id="Rectangle_6541"
              data-name="Rectangle 6541"
              width="15"
              height="162"
              transform="translate(-16940.23 -12426)"
              fill="url(#linear-gradient)"
            />
          </g>
        </svg>
      ) : type === "square" && isopen ? ( // carré ouvert
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="327"
          height="237"
          viewBox="0 0 327 237">
          <defs>
            <clipPath id="clip-path">
              <rect
                id="cover"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </clipPath>
            <linearGradient
              id="linear-gradient"
              y1="0.5"
              x2="1"
              y2="0.5"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopOpacity="0"
              />
              <stop
                offset="1"
                stopOpacity="0.341"
              />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="0.5"
              x2="0.5"
              y2="1"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopColor="#ffce82"
              />
              <stop
                offset="1"
                stopColor="#ebaa5c"
              />
            </linearGradient>
          </defs>
          <g
            id="openBook_portrait"
            transform="translate(16922 13225)">
            <rect
              id="back-for-blur"
              width="327"
              height="237"
              transform="translate(-16922 -13225)"
              fill="#fff"
              opacity="0"
            />
            <path
              id="shadow"
              d="M301.709,28.94l14.037,6.792V194.691c0,3.949,3.421-1.637-19.42,5.239S266.008,222.2,240.381,222.2c-27.061,0-40.885-14.759-40.885-14.759L180.137,193.59H36.911V28.2Z"
              transform="translate(-16932 -13226.372)"
              opacity="0.25"
              className="blur-md"
            />
            <rect
              id="book-back"
              width="287"
              height="174"
              transform="translate(-16922 -13217)"
              fill="#53273F"
            />
            <g
              id="last-pages"
              transform="translate(-16752 -13210.919)">
              <path
                id="Tracé_19025"
                data-name="Tracé 19025"
                d="M0,0H104.468V161.562H0Z"
                transform="translate(4.044 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19026"
                data-name="Tracé 19026"
                d="M0,0H104.468V161.562H0Z"
                transform="translate(3.37 0)"
                fill="#636262"
              />
              <path
                id="Tracé_19027"
                data-name="Tracé 19027"
                d="M0,0H104.468V161.562H0Z"
                transform="translate(2.696 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19028"
                data-name="Tracé 19028"
                d="M0,0H104.468V161.562H0Z"
                transform="translate(2.022 0)"
                fill="#636262"
              />
              <path
                id="Tracé_19029"
                data-name="Tracé 19029"
                d="M0,0H104.468V161.562H0Z"
                transform="translate(1.348 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19005"
                data-name="Tracé 19005"
                d="M0,0H105.167V161.562H0Z"
                transform="translate(0 0)"
                fill="#dad9d8"
              />
              <g
                id="Groupe_18151"
                data-name="Groupe 18151"
                transform="translate(60.718 11.117)">
                <path
                  id="Tracé_18999"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 8.026)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19024"
                  data-name="Tracé 19024"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 18.402)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-2"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 28.777)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19023"
                  data-name="Tracé 19023"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 39.153)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-3"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 49.529)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19022"
                  data-name="Tracé 19022"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 59.904)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-4"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 70.28)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19021"
                  data-name="Tracé 19021"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 80.655)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-5"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 91.031)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19020"
                  data-name="Tracé 19020"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 101.406)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-6"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 111.782)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19019"
                  data-name="Tracé 19019"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 122.157)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-7"
                  data-name="Tracé 18999"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 132.533)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19018"
                  data-name="Tracé 19018"
                  d="M0-8.012l35.915-.015V-4.54L0-4.525Z"
                  transform="translate(0 143.65)"
                  fill="#7b7b7b"
                />
              </g>
            </g>
            <g
              id="target"
              transform="translate(2722 -27)"
              clipPath="url(#clip-path)">
              <rect
                id="image"
                width="162"
                height="162"
                transform="translate(-19636 -13184)"
                fill="red"
              />
            </g>
           
            <g
              id="mark-back"
              transform="translate(-16732 -13223)"
              fill="#c89a57"
              stroke="#e4ab66"
              strokeWidth="1">
              <rect
                width="8"
                height="9"
                rx="4"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="7"
                height="8"
                rx="3.5"
                fill="none"
              />
            </g>
            <g
              id="second-page"
              transform="translate(-16752 -13219.07)">
              <path
                id="Tracé_18995"
                data-name="Tracé 18995"
                d="M0-2.848,26.783-6.314,82.9-11V165.186s-36.99-.315-57.715-3.236S0,159.364,0,159.364Z"
                transform="translate(0 11)"
                fill="#f3f3f3"
              />
              <g
                id="Groupe_18147"
                data-name="Groupe 18147"
                transform="translate(11.054 8.133)">
                <path
                  id="Tracé_18997"
                  data-name="Tracé 18997"
                  d="M0,9.333,58.9-4.026V.6L0,13.956Z"
                  transform="translate(0 4.026)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19012"
                  data-name="Tracé 19012"
                  d="M0,9.851,58.9-2.026V2.6L0,14.474Z"
                  transform="translate(0 14.625)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-2"
                  data-name="Tracé 18997"
                  d="M0,10.369,58.9-.026V4.6L0,14.992Z"
                  transform="translate(0 25.224)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19013"
                  data-name="Tracé 19013"
                  d="M0,10.369,58.9-.026V4.6L0,14.992Z"
                  transform="translate(0 36.341)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-3"
                  data-name="Tracé 18997"
                  d="M0,10.887,58.9,1.974V6.6L0,15.51Z"
                  transform="translate(0 46.94)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19014"
                  data-name="Tracé 19014"
                  d="M0,11.922,58.9,5.974V10.6L0,16.545Z"
                  transform="translate(0 57.021)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-4"
                  data-name="Tracé 18997"
                  d="M0,12.7,58.9,8.974V13.6L0,17.322Z"
                  transform="translate(0 67.361)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19015"
                  data-name="Tracé 19015"
                  d="M0,13.217l58.9-2.243V15.6L0,17.84Z"
                  transform="translate(0 77.96)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-5"
                  data-name="Tracé 18997"
                  d="M0,13.734l58.9-.761V17.6L0,18.358Z"
                  transform="translate(0 88.559)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19016"
                  data-name="Tracé 19016"
                  d="M0,14l58.9,2.2v4.623L0,18.623Z"
                  transform="translate(0 100.151)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-6"
                  data-name="Tracé 18997"
                  d="M0,14l58.9,4.427V23.05L0,18.623Z"
                  transform="translate(0 111.267)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19017"
                  data-name="Tracé 19017"
                  d="M0,14l58.9,7.392v4.623L0,18.623Z"
                  transform="translate(0 121.643)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-7"
                  data-name="Tracé 18997"
                  d="M0,14l58.9,8.133v4.623L0,18.623Z"
                  transform="translate(0 132.76)"
                  fill="#dad9d8"
                />
              </g>
            </g>
            <path
              id="page-shadow"
              d="M0,0H42V173.42H0Z"
              transform="translate(-16794 -13216.848)"
              fill="url(#linear-gradient)"
            />
            <g
              id="first-page"
              transform="translate(-16752 -13225)">
              <path
                id="Tracé_18995-2"
                data-name="Tracé 18995"
                d="M0-4.919l16.331-8.654L50.549-19V168.3s-22.555-1.8-35.192-4.718S0,157.293,0,157.293Z"
                transform="translate(0 19)"
                fill="#fff"
              />
              <g
                id="Groupe_18147-2"
                data-name="Groupe 18147"
                transform="translate(6.74 14.062)">
                <path
                  id="Tracé_18997-8"
                  data-name="Tracé 18997"
                  d="M0,9.333,35.915-4.026V.6L0,13.956Z"
                  transform="translate(0 4.026)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19012-2"
                  data-name="Tracé 19012"
                  d="M0,9.851,35.915-2.026V2.6L0,14.474Z"
                  transform="translate(0 14.625)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-9"
                  data-name="Tracé 18997"
                  d="M0,10.369,35.915-.026V4.6L0,14.992Z"
                  transform="translate(0 25.224)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19013-2"
                  data-name="Tracé 19013"
                  d="M0,10.369,35.915-.026V4.6L0,14.992Z"
                  transform="translate(0 36.341)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-10"
                  data-name="Tracé 18997"
                  d="M0,10.887,35.915,1.974V6.6L0,15.51Z"
                  transform="translate(0 46.94)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19014-2"
                  data-name="Tracé 19014"
                  d="M0,11.922,35.915,5.974V10.6L0,16.545Z"
                  transform="translate(0 57.021)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-11"
                  data-name="Tracé 18997"
                  d="M0,12.7,35.915,8.974V13.6L0,17.322Z"
                  transform="translate(0 67.361)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19015-2"
                  data-name="Tracé 19015"
                  d="M0,13.217l35.915-2.243V15.6L0,17.84Z"
                  transform="translate(0 77.96)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-12"
                  data-name="Tracé 18997"
                  d="M0,13.734l35.915-.761V17.6L0,18.358Z"
                  transform="translate(0 88.559)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19016-2"
                  data-name="Tracé 19016"
                  d="M0,14l35.915,2.2v4.623L0,18.623Z"
                  transform="translate(0 100.151)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-13"
                  data-name="Tracé 18997"
                  d="M0,14l35.915,4.427V23.05L0,18.623Z"
                  transform="translate(0 111.267)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19017-2"
                  data-name="Tracé 19017"
                  d="M0,14l35.915,7.392v4.623L0,18.623Z"
                  transform="translate(0 121.643)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-14"
                  data-name="Tracé 18997"
                  d="M0,14l35.915,8.133v4.623L0,18.623Z"
                  transform="translate(0 132.76)"
                  fill="#f3f3f3"
                />
              </g>
            </g>
            <g
              id="mark"
              transform="translate(-16750 -13215.487)"
              fill="url(#linear-gradient-2)">
              <path
                d="M 2.218283176422119 40.72732162475586 C 1.876513242721558 40.72732162475586 1.603803157806396 40.64813232421875 1.407703161239624 40.49196243286133 C 0.914984405040741 40.09955978393555 0.5862624645233154 39.03940582275391 0.4854031801223755 38.60198593139648 L 0.4854031801223755 2.897223234176636 L 0.4854031801223755 2.874593257904053 L 0.4833631813526154 2.85205340385437 C 0.4818331897258759 2.834883451461792 0.3340531885623932 1.070833325386047 0.9725831747055054 -0.02256665378808975 C 1.493093609809875 -0.9138975143432617 2.654226541519165 -1.481376767158508 3.065555095672607 -1.62803590297699 L 18.93710136413574 -6.78557825088501 C 18.74216651916504 -6.524209022521973 18.63491058349609 -6.265209674835205 18.61309242248535 -6.005976676940918 C 18.52539253234863 -4.964016437530518 18.37597274780273 -1.688426613807678 18.36966323852539 -1.549496650695801 L 18.36914253234863 -1.538146615028381 L 18.36914253234863 -1.526786684989929 L 18.36914253234863 34.06377029418945 C 18.25492477416992 34.67348098754883 17.91964530944824 35.71112442016602 17.47036361694336 36.02765274047852 C 17.33423233032227 36.12356185913086 17.14994239807129 36.17219161987305 16.92260360717773 36.17219161987305 C 16.47626304626465 36.17219161987305 16.02502632141113 35.98832321166992 15.90559387207031 35.9359245300293 L 9.667583465576172 31.58892250061035 L 9.256672859191895 31.30258369445801 L 8.971023559570312 31.71395301818848 L 2.753719091415405 40.66746520996094 C 2.627421617507935 40.69498443603516 2.433254480361938 40.72732162475586 2.218283176422119 40.72732162475586 Z"
                stroke="none"
              />
              <path
                d="M 18.11017608642578 -5.991119384765625 L 3.229921340942383 -1.15570068359375 C 2.858774185180664 -1.018848419189453 1.840274810791016 -0.5169181823730469 1.404354095458984 0.2295722961425781 C 0.9429531097412109 1.0196533203125 0.9426727294921875 2.35942268371582 0.9813137054443359 2.806882858276367 L 0.9854030609130859 2.851963043212891 L 0.9854030609130859 38.54484939575195 C 1.112453460693359 39.06833267211914 1.423839569091797 39.86562347412109 1.719192504882812 40.10084533691406 C 1.850452423095703 40.20538330078125 2.063053131103516 40.22732543945312 2.218282699584961 40.22732543945312 C 2.30522346496582 40.22732543945312 2.388246536254883 40.22055435180664 2.461912155151367 40.2110710144043 L 9.131643295288086 30.60602378845215 L 16.15020561218262 35.4969482421875 C 16.30993270874023 35.56283950805664 16.63519096374512 35.67218399047852 16.9226131439209 35.67218399047852 C 17.03965377807617 35.67218399047852 17.13433265686035 35.65277481079102 17.18239212036133 35.61891174316406 C 17.43451309204102 35.4412841796875 17.74353408813477 34.64546585083008 17.86914253234863 34.01558685302734 L 17.87017250061035 -1.572216033935547 C 17.87640380859375 -1.709114074707031 18.02118873596191 -4.883186340332031 18.11017608642578 -5.991119384765625 M 21.751953125 -8.1171875 C 21.751953125 -8.1171875 19.19922256469727 -7.008415222167969 19.1113224029541 -5.964057922363281 C 19.02343368530273 -4.919696807861328 18.86914253234863 -1.526786804199219 18.86914253234863 -1.526786804199219 L 18.86914253234863 34.10881423950195 C 18.86914253234863 34.10881423950195 18.5614128112793 35.87061309814453 17.75833320617676 36.4364013671875 C 16.95525360107422 37.00220489501953 15.65680313110352 36.37197494506836 15.65680313110352 36.37197494506836 L 9.381712913513184 31.99914360046387 L 3.058883666992188 41.10462188720703 C 3.058883666992188 41.1046257019043 1.864582061767578 41.49501419067383 1.096212387084961 40.88308334350586 C 0.3278427124023438 40.27114486694336 -0.01459693908691406 38.65689468383789 -0.01459693908691406 38.65689468383789 L -0.01459693908691406 2.897222518920898 C -0.01459693908691406 2.897222518920898 -0.1889667510986328 0.9749526977539062 0.5408134460449219 -0.2747154235839844 C 1.270584106445312 -1.524375915527344 2.904512405395508 -2.101436614990234 2.904512405395508 -2.101436614990234 L 18.86914253234863 -7.289226531982422 L 21.751953125 -8.1171875 Z"
                stroke="none"
                fill="#e4ab66"
              />
            </g>
          </g>
        </svg>
      ) : (
        // portrait ouvert
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="330"
          height="362.678"
          viewBox="0 0 330 362.678">
          <defs>
            <clipPath id="clip-path">
              <rect
                id="cover"
                width="160"
                height="275"
                transform="translate(0.074)"
                fill="red"
              />
            </clipPath>
            <linearGradient
              id="linear-gradient"
              y1="0.5"
              x2="1"
              y2="0.5"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopOpacity="0"
              />
              <stop
                offset="1"
                stopOpacity="0.341"
              />
            </linearGradient>
            <linearGradient
              id="linear-gradient-2"
              x1="0.5"
              x2="0.5"
              y2="1"
              gradientUnits="objectBoundingBox">
              <stop
                offset="0"
                stopColor="#ffce82"
              />
              <stop
                offset="1"
                stopColor="#ebaa5c"
              />
            </linearGradient>
          </defs>
          <g
            id="openBook_portrait"
            transform="translate(16923 13288.678)">
            <rect
              id="back-for-blur"
              width="330"
              height="314"
              transform="translate(-16923 -13240)"
              fill="#fff"
              opacity="0"
            />
            <path
              id="shadow"
              d="M310.927-82.034l14.526,7.029V202.611c0,4.086,3.54-1.694-20.1,5.422s-31.374,23.042-57.893,23.042c-28,0-42.308-15.272-42.308-15.272l-20.033-14.331H36.911V-82.8Z"
              transform="translate(-16939.846 -13173.813)"
              opacity="0.25"
              className="blur-sm"
            />
            <rect
              id="Rectangle_6527"
              data-name="Rectangle 6527"
              width="293"
              height="291"
              transform="translate(-16923 -13277)"
              fill="#53273f"
            />
            <path
              id="Tracé_19004"
              data-name="Tracé 19004"
              d="M0,0H167.64V274.225H0Z"
              transform="translate(-16915.18 -13268.523)"
              fill="#fff"
            />
            <g
              id="Groupe_de_masques_6"
              data-name="Groupe de masques 6"
              transform="translate(-16915.074 -13269)"
              clipPath="url(#clip-path)">
              <rect
                id="image"
                width="160"
                height="275"
                transform="translate(0.074)"
                fill="red"
              />
            </g>
            
            <g
              id="Rectangle_6531"
              data-name="Rectangle 6531"
              transform="translate(-16735 -13286)"
              fill="#c89a57"
              stroke="#e4ab66"
              strokeWidth="1">
              <rect
                width="9"
                height="12"
                rx="4"
                stroke="none"
              />
              <rect
                x="0.5"
                y="0.5"
                width="8"
                height="11"
                rx="3.5"
                fill="none"
              />
            </g>
            <path
              id="Tracé_19003"
              data-name="Tracé 19003"
              d="M0,0H43.462V290.782H0Z"
              transform="translate(-16798.928 -13276.802)"
              fill="url(#linear-gradient)"
            />
            <g
              id="last-pages"
              transform="translate(-16755.467 -13269.037)">
              <path
                id="Tracé_19025"
                data-name="Tracé 19025"
                d="M0,0H108.1V273.983H0Z"
                transform="translate(4.185 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19026"
                data-name="Tracé 19026"
                d="M0,0H108.1V273.983H0Z"
                transform="translate(3.487 0)"
                fill="#636262"
              />
              <path
                id="Tracé_19027"
                data-name="Tracé 19027"
                d="M0,0H108.1V273.983H0Z"
                transform="translate(2.79 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19028"
                data-name="Tracé 19028"
                d="M0,0H108.1V273.983H0Z"
                transform="translate(2.092 0)"
                fill="#636262"
              />
              <path
                id="Tracé_19029"
                data-name="Tracé 19029"
                d="M0,0H108.1V273.983H0Z"
                transform="translate(1.395 0)"
                fill="#fff"
              />
              <path
                id="Tracé_19005"
                data-name="Tracé 19005"
                d="M0,0H108.828V273.983H0Z"
                transform="translate(0 0)"
                fill="#dad9d8"
              />
              <g
                id="Groupe_18151"
                data-name="Groupe 18151"
                transform="translate(62.832 15.506)">
                <path
                  id="Tracé_18999"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 8.026)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19024"
                  data-name="Tracé 19024"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 22.498)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-2"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 36.97)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19023"
                  data-name="Tracé 19023"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 62.604)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-3"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 80.797)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19022"
                  data-name="Tracé 19022"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 98.99)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-4"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 117.182)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19021"
                  data-name="Tracé 19021"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 135.375)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-5"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 153.567)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19020"
                  data-name="Tracé 19020"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 171.76)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-6"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 189.953)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19019"
                  data-name="Tracé 19019"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 215.853)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_18999-7"
                  data-name="Tracé 18999"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 230.324)"
                  fill="#7b7b7b"
                />
                <path
                  id="Tracé_19018"
                  data-name="Tracé 19018"
                  d="M0-8.006l37.165-.021v4.863L0-3.143Z"
                  transform="translate(0 245.83)"
                  fill="#7b7b7b"
                />
              </g>
            </g>
            <g
              id="second-page"
              transform="translate(-16755.467 -13280.406)">
              <path
                id="Tracé_18995"
                data-name="Tracé 18995"
                d="M0,2.621,27.715-3.17,85.786-11V283.381s-38.278-.526-59.724-5.407S0,273.653,0,273.653Z"
                transform="translate(0 11)"
                fill="#f3f3f3"
              />
              <g
                id="Groupe_18147"
                data-name="Groupe 18147"
                transform="translate(11.438 11.343)">
                <path
                  id="Tracé_18997"
                  data-name="Tracé 18997"
                  d="M0,14.608,60.951-4.026V2.422L0,21.056Z"
                  transform="translate(0 4.026)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19012"
                  data-name="Tracé 19012"
                  d="M0,14.54,60.951-2.026V4.422L0,20.989Z"
                  transform="translate(0 19.599)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-2"
                  data-name="Tracé 18997"
                  d="M0,14.473,60.951-.026V6.422L0,20.921Z"
                  transform="translate(0 43.654)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19013"
                  data-name="Tracé 19013"
                  d="M0,14.473,60.951-.026V6.422L0,20.921Z"
                  transform="translate(0 62.901)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-3"
                  data-name="Tracé 18997"
                  d="M0,14.405,60.951,1.974V8.422L0,20.854Z"
                  transform="translate(0 82.547)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19014"
                  data-name="Tracé 19014"
                  d="M0,14.27l60.951-8.3v6.449L0,20.719Z"
                  transform="translate(0 102.461)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-4"
                  data-name="Tracé 18997"
                  d="M0,14.169l60.951-5.2v6.449L0,20.618Z"
                  transform="translate(0 122.057)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19015"
                  data-name="Tracé 19015"
                  d="M0,14.1l60.951-3.128v6.449L0,20.551Z"
                  transform="translate(0 141.406)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-5"
                  data-name="Tracé 18997"
                  d="M0,14.035l60.951-1.061v6.449L0,20.483Z"
                  transform="translate(0 160.682)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19016"
                  data-name="Tracé 19016"
                  d="M0,14l60.951,3.074v6.449L0,20.449Z"
                  transform="translate(0 181.578)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-6"
                  data-name="Tracé 18997"
                  d="M0,14l60.951,6.175v6.449L0,20.449Z"
                  transform="translate(0 201.214)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_19017"
                  data-name="Tracé 19017"
                  d="M0,14,60.951,24.31v6.449L0,20.449Z"
                  transform="translate(0 223.831)"
                  fill="#dad9d8"
                />
                <path
                  id="Tracé_18997-7"
                  data-name="Tracé 18997"
                  d="M0,14,60.951,25.343v6.449L0,20.449Z"
                  transform="translate(0 239.336)"
                  fill="#dad9d8"
                />
              </g>
            </g>
            <g
              id="first-page"
              transform="translate(-16755.467 -13288.678)">
              <path
                id="Tracé_18995-2"
                data-name="Tracé 18995"
                d="M0,4.3,16.9-10.021,52.309-19V290.886s-23.34-2.973-36.417-7.806S0,272.671,0,272.671Z"
                transform="translate(0 19)"
                fill="#fff"
              />
              <g
                id="Groupe_18147-2"
                data-name="Groupe 18147"
                transform="translate(6.974 19.613)">
                <path
                  id="Tracé_18997-8"
                  data-name="Tracé 18997"
                  d="M0,14.608,37.165-4.026V2.422L0,21.056Z"
                  transform="translate(0 4.026)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19012-2"
                  data-name="Tracé 19012"
                  d="M0,14.54,37.165-2.026V4.422L0,20.989Z"
                  transform="translate(0 19.599)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-9"
                  data-name="Tracé 18997"
                  d="M0,14.473,37.165-.026V6.422L0,20.921Z"
                  transform="translate(0 43.654)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19013-2"
                  data-name="Tracé 19013"
                  d="M0,14.473,37.165-.026V6.422L0,20.921Z"
                  transform="translate(0 62.901)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-10"
                  data-name="Tracé 18997"
                  d="M0,14.405,37.165,1.974V8.422L0,20.854Z"
                  transform="translate(0 82.547)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19014-2"
                  data-name="Tracé 19014"
                  d="M0,14.27l37.165-8.3v6.449L0,20.719Z"
                  transform="translate(0 102.461)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-11"
                  data-name="Tracé 18997"
                  d="M0,14.169l37.165-5.2v6.449L0,20.618Z"
                  transform="translate(0 122.057)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19015-2"
                  data-name="Tracé 19015"
                  d="M0,14.1l37.165-3.128v6.449L0,20.551Z"
                  transform="translate(0 141.406)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-12"
                  data-name="Tracé 18997"
                  d="M0,14.035l37.165-1.061v6.449L0,20.483Z"
                  transform="translate(0 160.682)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19016-2"
                  data-name="Tracé 19016"
                  d="M0,14l37.165,3.074v6.449L0,20.449Z"
                  transform="translate(0 181.578)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-13"
                  data-name="Tracé 18997"
                  d="M0,14l37.165,6.175v6.449L0,20.449Z"
                  transform="translate(0 201.214)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_19017-2"
                  data-name="Tracé 19017"
                  d="M0,14,37.165,24.31v6.449L0,20.449Z"
                  transform="translate(0 223.831)"
                  fill="#f3f3f3"
                />
                <path
                  id="Tracé_18997-14"
                  data-name="Tracé 18997"
                  d="M0,14,37.165,25.343v6.449L0,20.449Z"
                  transform="translate(0 239.336)"
                  fill="#f3f3f3"
                />
              </g>
            </g>
            <g
              id="mark"
              transform="translate(-16753.398 -13278.119)"
              fill="url(#linear-gradient-2)">
              <path
                d="M 2.296652317047119 60.28240585327148 C 1.962812304496765 60.28240585327148 1.70273232460022 60.17731857299805 1.50155234336853 59.96112823486328 C 0.946485161781311 59.36463928222656 0.5870730876922607 57.76865005493164 0.4860423505306244 57.15342330932617 L 0.4860423505306244 7.26220703125 L 0.4860423505306244 7.24541711807251 L 0.4849123358726501 7.22866678237915 C 0.4832223355770111 7.203197002410889 0.3225023448467255 4.642646789550781 1.019652366638184 3.031826972961426 C 1.672519564628601 1.523327231407166 3.117202520370483 0.7857667207717896 3.216583728790283 0.7365469932556152 L 19.71800422668457 -6.498821258544922 L 19.90183639526367 -6.570061683654785 C 19.55899620056152 -6.12642765045166 19.30978584289551 -5.639316082000732 19.27876281738281 -5.141892910003662 C 19.18840217590332 -3.693183183670044 19.03398323059082 0.8743969202041626 19.02745246887207 1.068126916885376 L 19.02717208862305 1.076546907424927 L 19.02717208862305 1.084966897964478 L 19.02717208862305 50.80994033813477 C 18.90752792358398 51.69921112060547 18.53756141662598 53.25101089477539 18.033203125 53.73047637939453 C 17.89759254455566 53.8593864440918 17.72738265991211 53.92205810546875 17.51283264160156 53.92208862304688 C 17.07846450805664 53.9221305847168 16.63112449645996 53.6763801574707 16.50838661193848 53.60372924804688 L 10.05197238922119 47.53286743164062 L 9.56853199005127 47.07829666137695 L 9.26488208770752 47.66833877563477 L 2.813090085983276 60.20516204833984 C 2.689554691314697 60.24101638793945 2.502391576766968 60.28240585327148 2.296652317047119 60.28240585327148 Z"
                stroke="none"
              />
              <path
                d="M 18.83889770507812 -5.567413330078125 L 3.431041717529297 1.188457489013672 C 3.301885604858398 1.255035400390625 2.040365219116211 1.932247161865234 1.478511810302734 3.230426788330078 C 0.9408931732177734 4.472637176513672 0.9391517639160156 6.514148712158203 0.9837932586669922 7.195125579833984 L 0.9860420227050781 7.26220703125 L 0.9860420227050781 57.11236190795898 C 1.120468139648438 57.90840911865234 1.479610443115234 59.20358657836914 1.867582321166992 59.62049865722656 C 1.937723159790039 59.69587707519531 2.049892425537109 59.78239822387695 2.296663284301758 59.78239822387695 C 2.359090805053711 59.78239822387695 2.41960334777832 59.77692031860352 2.47540283203125 59.76865386962891 L 9.427602767944336 46.25944519042969 L 16.80880546569824 53.19989013671875 C 16.95928955078125 53.2828369140625 17.26362609863281 53.42208862304688 17.51289176940918 53.42208862304688 C 17.63190269470215 53.42208862304688 17.66608238220215 53.38959503173828 17.68870162963867 53.36809539794922 C 18.0179328918457 53.05511856079102 18.38930130004883 51.76664352416992 18.52717208862305 50.77571487426758 L 18.52774238586426 1.051288604736328 C 18.53428268432617 0.8572578430175781 18.68893241882324 -3.717243194580078 18.77973175048828 -5.173023223876953 C 18.78788185119629 -5.303699493408203 18.8076114654541 -5.435146331787109 18.83889770507812 -5.567413330078125 M 22.51034164428711 -8.117191314697266 C 22.51034164428711 -8.117191314697266 19.86874198913574 -6.569011688232422 19.77779197692871 -5.110771179199219 C 19.68684196472168 -3.652534484863281 19.52717208862305 1.084968566894531 19.52717208862305 1.084968566894531 L 19.52717208862305 50.84285736083984 C 19.52717208862305 50.84285736083984 19.20874214172363 53.30284881591797 18.37769317626953 54.09286499023438 C 17.54665374755859 54.88287734985352 16.2030029296875 54.00289535522461 16.2030029296875 54.00289535522461 L 9.70946216583252 47.89711761474609 L 3.166511535644531 60.61108779907227 C 3.166511535644531 60.61108779907227 1.930635452270508 61.15617752075195 1.135522842407227 60.30173492431641 C 0.3404026031494141 59.44729614257812 -0.01395797729492188 57.19332885742188 -0.01395797729492188 57.19332885742188 L -0.01395797729492188 7.26220703125 C -0.01395797729492188 7.26220703125 -0.1944084167480469 4.578136444091797 0.5607814788818359 2.833236694335938 C 1.315961837768555 1.088325500488281 3.006772994995117 0.2825851440429688 3.006772994995117 0.2825851440429688 L 19.52717208862305 -6.961101531982422 L 22.51034164428711 -8.117191314697266 Z"
                stroke="none"
                fill="#e4ab66"
              />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
}

export default BookPreview;
