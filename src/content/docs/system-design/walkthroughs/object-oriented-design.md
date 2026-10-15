---
title: Object-oriented design
description: Reusable class-design exercises covering hash maps, caches, call centers, and other domain models.
sidebar:
  order: 9
---

These exercises focus on class design rather than distributed systems. The examples use Python.

## The six questions

| # | Question | Core idea |
| --- | --- | --- |
| 1 | Design a hash map | Chained buckets, `hash % size` |
| 2 | Design an LRU cache | Doubly-linked list + hash table |
| 3 | Design a call center | Ranked employees, dispatch queue |
| 4 | Design a deck of cards | Suit/value enums, deal logic |
| 5 | Design a parking lot | Vehicle sizes, spot assignment |
| 6 | Design a chat server | User service, friend requests |

## Hash map

```python
class Item:
    def __init__(self, key, value): ...

class HashTable:
    def __init__(self, size):
        self.table = [[] for _ in range(size)]   # chained buckets
    def _hash_function(self, key):
        return hash(key) % self.size
    def set(self, key, value): ...   # append or replace in bucket
    def get(self, key): ...          # walk the bucket
```

:::tip[The point]
Show you know [chaining](/reference/system-design-glossary/) and the `hash % size` index.
:::

## LRU cache

- `Node`: holds the result.
- `LinkedList`: `move_to_front`, `append_to_front`, `remove_from_tail`.
- `Cache`: a hash map (`query → node`) plus the linked list; evicts the tail at capacity.

## Call center

- `Rank` enum: operator, supervisor, director.
- `Employee` (abstract) holds rank and current call.
- A dispatch `deque` routes calls to the lowest-rank free employee; escalate if busy.

## Deck of cards

- `Suit` enum (heart, diamond, clubs, spade); `Card` (abstract) with value, suit, availability.
- Deck, hand, and deal logic. Blackjack-style scoring is a common extension.

## Parking lot

- `VehicleSize` enum: motorcycle, compact, large.
- `Vehicle` tracks `license_plate`, `spot_size`, and the spots it occupies.
- `ParkingLot` assigns spots by size and frees them on exit.

## Chat server

- `UserService`: `add_user`, `remove_user`, and friend-request methods.
- `User`, `Message`, and conversation management.

## How to structure the design

1. State the entities and their relationships.
2. Draw a class diagram (Mermaid `classDiagram`).
3. Write the key methods.
4. Agree on the amount of code before implementing.

<div data-anatomy="system-design--walkthroughs--object-oriented-design-1"></div>
---
