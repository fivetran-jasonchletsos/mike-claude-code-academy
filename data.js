// Iggles Card Vault — seed data
// Two decks: Legends (retired greats) and Modern Era (2010-present)
// "tier" is just fun collector flavor (Common/Uncommon/Rare/Grail) — not a real appraisal.

const EAGLES_CARDS = [
  // ---- Legends deck ----
  { name: "Chuck Bednarik", deck: "legends", position: "C / LB", years: "1949-1962", tier: "Grail", blurb: "Called ‘Concrete Charlie’ — the last true 60-minute two-way player in the NFL, and his open-field hit on Frank Gifford in 1960 is still shown in highlight reels." },
  { name: "Norm Van Brocklin", deck: "legends", position: "QB", years: "1958-1960", tier: "Grail", blurb: "Threw the 1960 NFL Championship team to the title over Vince Lombardi’s Packers — Philly’s only NFL title between then and 2018." },
  { name: "Tommy McDonald", deck: "legends", position: "WR", years: "1957-1963", tier: "Rare", blurb: "5-foot-9 Hall of Fame receiver who played bigger than his size in an era before facemasks got serious." },
  { name: "Harold Carmichael", deck: "legends", position: "WR", years: "1971-1983", tier: "Rare", blurb: "At 6-foot-8, the tallest wide receiver of his era and the franchise’s all-time leading receiver for decades." },
  { name: "Wilbert Montgomery", deck: "legends", position: "RB", years: "1977-1984", tier: "Rare", blurb: "His 194-yard game against Dallas sent the Eagles to their first Super Bowl, capping the 1980 season." },
  { name: "Ron Jaworski", deck: "legends", position: "QB", years: "1977-1986", tier: "Uncommon", blurb: "‘Jaws’ quarterbacked that Super Bowl XV run, then became one of the most recognizable voices in football broadcasting." },
  { name: "Reggie White", deck: "legends", position: "DE", years: "1985-1992", tier: "Grail", blurb: "The ‘Minister of Defense’ — a Hall of Fame pass rusher who redefined what a defensive lineman could do." },
  { name: "Randall Cunningham", deck: "legends", position: "QB", years: "1985-1995", tier: "Grail", blurb: "A dual-threat quarterback before the term existed, and once boomed a 91-yard punt as the emergency punter." },
  { name: "Jerome Brown", deck: "legends", position: "DT", years: "1987-1991", tier: "Rare", blurb: "An interior force on the legendary ‘Gang Green’ defense, his career cut tragically short by a 1992 car accident." },
  { name: "Seth Joyner", deck: "legends", position: "LB", years: "1986-1993", tier: "Uncommon", blurb: "Relentless linebacker and one of the leaders of that feared late-’80s/early-’90s Eagles defense." },
  { name: "Eric Allen", deck: "legends", position: "CB", years: "1988-1994", tier: "Rare", blurb: "A shutdown corner with a knack for turning interceptions into pick-six highlights." },
  { name: "Troy Vincent", deck: "legends", position: "CB", years: "1996-2003", tier: "Uncommon", blurb: "Steady, physical corner who went on to become the NFL’s Executive VP of Football Operations." },
  { name: "Brian Dawkins", deck: "legends", position: "S", years: "1996-2008", tier: "Grail", blurb: "‘Weapon X’ — a Hall of Fame safety whose pregame intensity became as legendary as his hitting." },
  { name: "Donovan McNabb", deck: "legends", position: "QB", years: "1999-2009", tier: "Rare", blurb: "Five-time Pro Bowler who carried the Eagles to Super Bowl XXXIX and a run of NFC title game appearances." },
  { name: "Brian Westbrook", deck: "legends", position: "RB", years: "2002-2009", tier: "Uncommon", blurb: "An undersized do-everything back — runner, receiver, returner — who made the offense go for a decade." },

  // ---- Modern Era deck ----
  { name: "LeSean McCoy", deck: "modern", position: "RB", years: "2009-2014", tier: "Rare", blurb: "‘Shady’ McCoy made defenders miss for a living and held the franchise rushing record for years." },
  { name: "Jason Peters", deck: "modern", position: "OT", years: "2009-2019", tier: "Uncommon", blurb: "A perennial Pro Bowl left tackle who protected blind sides for over a decade in Midnight Green." },
  { name: "Fletcher Cox", deck: "modern", position: "DT", years: "2012-2023", tier: "Rare", blurb: "A disruptive Pro Bowl defensive tackle and a cornerstone of the Super Bowl LII championship defense." },
  { name: "Zach Ertz", deck: "modern", position: "TE", years: "2013-2021", tier: "Grail", blurb: "Caught the go-ahead touchdown against the Patriots in Super Bowl LII — one of the most replayed grabs in franchise history." },
  { name: "Lane Johnson", deck: "modern", position: "OT", years: "2013-present", tier: "Rare", blurb: "An elite right tackle with two Super Bowl rings, still anchoring the line." },
  { name: "Carson Wentz", deck: "modern", position: "QB", years: "2016-2020", tier: "Uncommon", blurb: "Had the Eagles rolling toward the top seed in 2017 before a torn ACL handed the reins to Nick Foles." },
  { name: "Nick Foles", deck: "modern", position: "QB", years: "2016-2018", tier: "Grail", blurb: "The backup-turned-folk-hero who called ‘Philly Special’ and won Super Bowl LII MVP against Tom Brady’s Patriots." },
  { name: "Jake Elliott", deck: "modern", position: "K", years: "2017-present", tier: "Common", blurb: "Reliable leg who’s quietly been banging in field goals since his rookie year." },
  { name: "Jason Kelce", deck: "modern", position: "C", years: "2011-2023", tier: "Grail", blurb: "A Super Bowl LII champion and future Hall of Fame center whose sleeveless Mummers Parade speech is Philly legend." },
  { name: "Jalen Hurts", deck: "modern", position: "QB", years: "2020-present", tier: "Grail", blurb: "Led the Eagles to Super Bowl LVII, then back to the mountaintop with a Super Bowl LIX win — the ‘tush push’ is basically his." },
  { name: "DeVonta Smith", deck: "modern", position: "WR", years: "2021-present", tier: "Rare", blurb: "Heisman winner at Alabama turned crisp route-runner and reliable target in Philly." },
  { name: "A.J. Brown", deck: "modern", position: "WR", years: "2022-present", tier: "Rare", blurb: "Traded in from Tennessee and immediately became one of the league’s most explosive deep threats." },
  { name: "Darius Slay", deck: "modern", position: "CB", years: "2020-present", tier: "Uncommon", blurb: "‘Big Play Slay’ brings the swagger and the ball skills to a rebuilt secondary." },
  { name: "Saquon Barkley", deck: "modern", position: "RB", years: "2024-present", tier: "Grail", blurb: "Signed away from the Giants and immediately delivered one of the best rushing seasons in NFL history en route to Super Bowl LIX." },
  { name: "Dallas Goedert", deck: "modern", position: "TE", years: "2018-present", tier: "Uncommon", blurb: "The steady, physical tight end who’s been a reliable safety-valve target for years." },
];
