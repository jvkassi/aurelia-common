const humanizeDuration = require("humanize-duration");

export class SecondValueConverter {
  // to View
  toView(seconds: number, options: any) {
    var shortEnglishHumanizer = humanizeDuration.humanizer({
      language: "shortEn",
      largest: 2,
      units: ["y", "mo", "w", "d", "h", "m", "s", "ms"],
      languages: {
        shortEn: {
          y: function() {
            return "ans";
          },
          mo: function() {
            return "mois";
          },
          w: function() {
            return "w";
          },
          d: function() {
            return "jours";
          },
          h: function() {
            return "h";
          },
          m: function() {
            return "m";
          },
          s: function() {
            return "s";
          },
          ms: function() {
            return "ms";
          }
        }
      }
    });
    return shortEnglishHumanizer(seconds * 1000, options);
  }
}
