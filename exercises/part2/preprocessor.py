# Preprocessor to handle ||| custom blocks.

import sys
import json
import re

# this is for when mdbook first pokes the preprocessor to see if it works
if len(sys.argv) > 1:
    if sys.argv[1] == 'supports':
        # sys.argv[2] is the renderer name
        sys.exit(0)

def begin_block(acc, type):
    acc += ["", f'<div class="{type} container">', f'<header><span class="{type}-title"></span></header>', '<div class="container-content">', ""]

def end_block(acc):
    acc += ["", "</div>", "</div>", ""]

def process(item):
    """
    The item has a ['content'] field with the page text.
    Process this.
    """
    content = item['content']
    lines = content.split('\n')
    out = []
    block = False
    for line in lines:
        if block is False:
            if (m := re.match("\|\|\|([a-z]+)", line)) is not None:
                begin_block(out, m.group(1))
                block = True
            else:
                out.append(line)
        else:
            if re.match("\|\|\|", line) is not None:
                end_block(out)
                block = False
            else:
               out.append(line)
    item['content'] = "\n".join(out)

context, book = json.load(sys.stdin)

#log = open("preprocessor.log", "a")

sections = book['sections']
for section in sections:
    #log.write("SECTION\n")
    #for k in section:
    #    log.write(f"  {k}\n")

    if 'Chapter' in section:
        process(section['Chapter'])
        for subitem in section['Chapter']['sub_items']:
            process(subitem['Chapter'])

#log.close()

#with open("log", "w") as log:
#    json.dump(book, log)
json.dump(book, sys.stdout)
