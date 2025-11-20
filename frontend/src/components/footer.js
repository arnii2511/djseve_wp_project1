import React from "react";

export default function Footer() {
  return React.createElement(
    "footer",
    { className: "custom-footer" },
    React.createElement(
      "div",
      { className: "container text-center py-3" },
      React.createElement(
        "p",
        { className: "m-0 footer-text" },
        `© ${new Date().getFullYear()} College Events Portal · All Rights Reserved`
      )
    )
  );
}
