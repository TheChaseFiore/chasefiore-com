---
title: "Monopoly"
description: ""
publishDate: 2024-01-01
coverImage: ./monopoly_01.jpg
tags: ["Programming"]
youtubeId: "MEq2t7k_ncA"
githubRepo: "TheChaseFiore/monopoly"
---

```python
class game(Animation):
    def __init__(self):
        self.timerDelay = 1
        self.housesLeft = 32
        self.hotelsLeft = 12
        self.board = makeProperties()
        self.players = [player("Dog"), player("Hat")]
        self.currentPlayer = 0
        self.lastRoll = 0
        self.lastCard = ""
        self.over = False
        self.chanceCards = [
            ["self.players[self.currentPlayer].position = 10",       "Go Directly to Jail"],
            ["self.players[self.currentPlayer].position -= 3",        "Go Back Three Spaces"],
            ["self.players[self.currentPlayer].cash -= int(15)",      "Speeding Fine $15"],
            ["self.players[self.currentPlayer].advanceTo(5)",         "Take a Ride on the Reading Railroad"],
            ["self.players[self.currentPlayer].cash += int(150)",     "Your Building Loan Matures. Collect $150"],
            ["self.players[self.currentPlayer].advanceTo(24)",        "Advance to Illinois Ave."],
            ["self.players[self.currentPlayer].advanceTo(11)",        "Advance to St. Charles Place"],
            ["self.players[self.currentPlayer].advanceTo(39)",        "Advance to Boardwalk"],
            ["self.players[self.currentPlayer].cash += int(50)",      "Bank Pays You Dividend of $50"],
            ["self.players[self.currentPlayer].advanceTo(0)",         "Advance to Go"],
        ]
```
