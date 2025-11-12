# Dnd Party Funds Tracker

One day while looting the now smoldering ruins of a circus (it was run by
murderous vampiric clowns! it needed to be dismantled, I promise) my druid
and her teammates came across a large sum of various riches. Delighted as we were, our group was not immediately eager to do the math needed to divide the
loot between us.

The purpose of this App is to allow dnd players to keep track of the
collective net worth of their party (in currency, this app is not
intended to track the many non-coin items a party may collect).
There will exist a central pool of resources from which party members
may draw and deposit different units of currency. Each transaction being logged
with the party member associated with the exchange, for tracking purposes.

Inspired by multi-user campaign managment sites like [DndBeyond](https://www.dndbeyond.com/) and [Scabard](https://www.scabard.com/pbs/), users will be
able to create their party and add members. The individual party members will be eligable for claim by another user but would also be trackable without an
active claim being necessary (let's assume the party manager—treasurer?—retains
custody of unclaimed party members until otherwise handled).

To keep track of users and their actions I'll need authentication and profile handling. I'm looking into using **Google Cloud** services for managing such things on the backend.