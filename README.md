Project Title: Interactive Character Distribution and Flow Visualization

Project Overview:

This project explores text-based character analysis using linked D3 visualizations.

It dynamically transforms user-entered text into two coordinated visual components: a treemap and a Sankey diagram.

The goal is to demonstrate how interactive linking can reveal structural relationships within textual data.

Data Description:

The dataset is generated dynamically from user-input text.

Characters are categorized into vowels, consonants, and punctuation.

Character counts are computed in a case-insensitive manner.

The Sankey visualization is constructed from adjacency relationships, showing characters that appear immediately before and after a selected character.

Visualization Design and Techniques:

A hierarchical treemap displays character frequency distribution.

Rectangles are grouped by character type (vowel, consonant, punctuation) and sized by count.

A categorical color scale visually distinguishes character groups.

A Sankey diagram illustrates character flow relationships (preceding → selected → following).

Node sizes correspond to transition frequencies.

Interactive Features:

Users enter custom text to generate visualizations dynamically.

Clicking a character in the treemap generates a corresponding Sankey diagram.

Hover tooltips display character names and counts.

Charts update in real time based on new input.

Linked components reinforce exploration of structural relationships within the text.

Technical Highlights:

Built using D3.js v7 and d3-sankey.

Implements hierarchical data transformation for treemap rendering.

Uses event-driven updates and interactive tooltips.

Demonstrates coordination between multiple visualization panels.

Key Insights:

Character frequency patterns become immediately visible through spatial encoding.

Flow relationships reveal contextual positioning of characters.

Linking visualizations enhances interpretability compared to isolated charts.
