#!/usr/bin/env python3
"""
SVG Component Extractor

This script extracts individual <g id="..."> blocks from a bulk SVG file
and saves them as separate SVG files. Each extracted component maintains
proper SVG structure with namespaces and viewBox attributes.

Usage: python extract_svg_components.py <input_svg_file> [output_directory]
"""

import os
import sys
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from xml.dom import minidom


def extract_svg_components(input_file, output_dir="extracted_components"):
    """
    Extract individual <g id="..."> components from an SVG file.

    Args:
        input_file (str): Path to the input SVG file
        output_dir (str): Directory to save extracted components
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)

    # Parse the SVG file
    try:
        tree = ET.parse(input_file)
        root = tree.getroot()
    except ET.ParseError as e:
        print(f"Error parsing SVG file: {e}")
        return
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
        return

    # Extract SVG attributes and namespaces
    svg_attrs = root.attrib.copy()

    # Common SVG namespaces
    namespaces = {
        "": "http://www.w3.org/2000/svg",
        "xmlns": "http://www.w3.org/2000/svg",
        "xmlns:xlink": "http://www.w3.org/1999/xlink",
        "xmlns:dc": "http://purl.org/dc/elements/1.1/",
        "xmlns:cc": "http://creativecommons.org/ns#",
        "xmlns:rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "xmlns:svg": "http://www.w3.org/2000/svg",
        "xmlns:sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
        "xmlns:inkscape": "http://www.inkscape.org/namespaces/inkscape",
    }

    # Register namespaces for ElementTree
    for prefix, uri in namespaces.items():
        if prefix:  # Skip empty prefix
            ET.register_namespace(prefix.replace("xmlns:", ""), uri)

    # Find all <g> elements with id attributes
    components_found = 0
    skipped_components = 0

    # Look for <g> elements with id attributes
    for g_element in root.iter():
        if g_element.tag.endswith("}g") or g_element.tag == "g":
            component_id = g_element.get("id")
            if component_id:
                # Skip category/section groups (they typically contain other groups)
                if has_nested_groups_with_ids(g_element):
                    print(
                        f"Skipping category group: {component_id} (contains nested components)"
                    )
                    skipped_components += 1
                    continue

                # Calculate bounding box for the component
                bbox = calculate_bounding_box(g_element)
                if bbox is None:
                    print(
                        f"Warning: Could not calculate bounding box for {component_id}, using default"
                    )
                    bbox = (0, 0, 100, 100)

                # Create new SVG for this component
                component_svg = create_component_svg(g_element, bbox, namespaces)

                # Save the component
                output_file = output_path / f"{component_id}.svg"
                try:
                    with open(output_file, "w", encoding="utf-8") as f:
                        f.write(component_svg)
                    print(f"Extracted: {component_id}.svg")
                    components_found += 1
                except IOError as e:
                    print(f"Error saving {component_id}.svg: {e}")

    print(f"\nExtraction complete!")
    print(f"Components extracted: {components_found}")
    print(f"Category groups skipped: {skipped_components}")
    print(f"Output directory: {output_path.absolute()}")


def has_nested_groups_with_ids(element):
    """Check if an element contains nested <g> elements with id attributes."""
    for child in element:
        if (child.tag.endswith("}g") or child.tag == "g") and child.get("id"):
            return True
    return False


def calculate_bounding_box(element):
    """
    Calculate bounding box for an SVG element.
    This is a simplified implementation that looks for basic shapes.
    """
    min_x, min_y = float("inf"), float("inf")
    max_x, max_y = float("-inf"), float("-inf")
    found_coords = False

    # Check for transform attribute on the group itself
    transform = element.get("transform", "")
    translate_x, translate_y = parse_translate(transform)

    # Recursively check all child elements
    for child in element.iter():
        # Handle different SVG elements
        if child.tag.endswith("}rect") or child.tag == "rect":
            x = float(child.get("x", 0)) + translate_x
            y = float(child.get("y", 0)) + translate_y
            width = float(child.get("width", 0))
            height = float(child.get("height", 0))
            min_x, max_x = min(min_x, x), max(max_x, x + width)
            min_y, max_y = min(min_y, y), max(max_y, y + height)
            found_coords = True

        elif child.tag.endswith("}circle") or child.tag == "circle":
            cx = float(child.get("cx", 0)) + translate_x
            cy = float(child.get("cy", 0)) + translate_y
            r = float(child.get("r", 0))
            min_x, max_x = min(min_x, cx - r), max(max_x, cx + r)
            min_y, max_y = min(min_y, cy - r), max(max_y, cy + r)
            found_coords = True

        elif child.tag.endswith("}path") or child.tag == "path":
            # Simple path parsing - look for M commands
            d = child.get("d", "")
            coords = extract_path_coordinates(d)
            for x, y in coords:
                x += translate_x
                y += translate_y
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
                found_coords = True

    if not found_coords:
        return None

    # Add some padding
    padding = 5
    return (
        min_x - padding,
        min_y - padding,
        max_x - min_x + 2 * padding,
        max_y - min_y + 2 * padding,
    )


def parse_translate(transform_str):
    """Parse translate transformation from transform attribute."""
    if not transform_str:
        return 0, 0

    # Look for translate(x,y) or translate(x y)
    match = re.search(
        r"translate\s*\(\s*([-\d.]+)(?:[,\s]+([-\d.]+))?\s*\)", transform_str
    )
    if match:
        x = float(match.group(1))
        y = float(match.group(2)) if match.group(2) else 0
        return x, y

    return 0, 0


def extract_path_coordinates(d):
    """Extract basic coordinates from a path d attribute."""
    coords = []
    # Simple regex to find M (move) and L (line) commands
    matches = re.findall(r"[ML]\s*([-\d.]+)[,\s]+([-\d.]+)", d)
    for match in matches:
        coords.append((float(match[0]), float(match[1])))
    return coords


def create_component_svg(g_element, bbox, namespaces):
    """Create a complete SVG document for a component."""
    x, y, width, height = bbox

    # Create the SVG wrapper
    svg_attrs = {
        "xmlns": namespaces["xmlns"],
        "xmlns:xlink": namespaces.get("xmlns:xlink", ""),
        "width": str(int(width)),
        "height": str(int(height)),
        "viewBox": f"{x} {y} {width} {height}",
        "version": "1.1",
    }

    # Build SVG string manually for better control
    svg_parts = ['<?xml version="1.0" encoding="UTF-8" standalone="no"?>']

    # Start SVG tag
    svg_start = "<svg"
    for attr, value in svg_attrs.items():
        if value:  # Only include non-empty attributes
            svg_start += f' {attr}="{value}"'
    svg_start += ">"
    svg_parts.append(svg_start)

    # Convert the group element to string
    group_str = ET.tostring(g_element, encoding="unicode")
    svg_parts.append(group_str)

    # Close SVG tag
    svg_parts.append("</svg>")

    # Join and format
    svg_content = "\n".join(svg_parts)

    # Pretty print using minidom
    try:
        dom = minidom.parseString(svg_content)
        return dom.toprettyxml(indent="  ", encoding=None)
    except:
        # If pretty printing fails, return as-is
        return svg_content


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print(
            "Usage: python extract_svg_components.py <input_svg_file> [output_directory]"
        )
        print("\nExample:")
        print("  python extract_svg_components.py electrical_symbols.svg components/")
        sys.exit(1)

    input_file = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "extracted_components"

    print(f"Extracting components from: {input_file}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)

    extract_svg_components(input_file, output_dir)


if __name__ == "__main__":
    main()


