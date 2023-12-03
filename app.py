# Import the json module
import json
# Import the sys module to get the command line argument
import sys

# Get the name and path of the coverage.json file from the command line argument
coverage_file = sys.argv[1]

# Open the coverage.json file and load the data
with open(coverage_file) as f:
    data = json.load(f)

# Create an empty list to store the used CSS rules
used_css = []

# Loop through the entries in the data
for entry in data:
    # Check if the entry is a CSS file
    if entry["type"] == "CSS":
        # Get the URL of the CSS file
        url = entry["url"]
        # Get the text of the CSS file
        text = entry["text"]
        # Get the ranges of the used CSS rules
        ranges = entry["ranges"]
        # Loop through the ranges
        for range in ranges:
            # Get the start and end offsets of the range
            start = range["start"]
            end = range["end"]
            # Slice the text using the offsets
            slice = text[start:end]
            # Add the slice to the used CSS list
            used_css.append(slice)

# Join the used CSS list into a single string
used_css = "\n".join(used_css)

# Create a new file called used_css.css
with open(coverage_file, errors="ignore") as f:
    # Write the used CSS string to the file
    f.write(used_css)

# Print a message to indicate the success
print("Used CSS extracted from " + coverage_file + " and saved to used_css.css")
