import React from "react";

const nombreEstrella = (num) => (num === 1 ? "1 estrella" : `${num} estrellas`);

export default function StarRating({ rating, setRating, id, idEtiqueta }) {
  return (
    <div
      id={id}
      role="group"
      aria-labelledby={idEtiqueta}
      style={{ fontSize: "26px", cursor: "pointer", margin: "8px 0" }}
    >
      {[1, 2, 3, 4, 5].map(num => (
        <button
          key={num}
          type="button"
          aria-label={nombreEstrella(num)}
          aria-pressed={num <= rating}
          onClick={() => setRating(num)}
          style={{
            color: num <= rating ? "gold" : "lightgray",
            marginRight: "5px",
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            cursor: "pointer"
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
