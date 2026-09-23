#!/bin/bash
echo "Testing for aria-label in buttons..."
grep -rni "<button" iconnect-web/src | grep -vi "aria-label" | wc -l
echo "Buttons missing aria-label"
