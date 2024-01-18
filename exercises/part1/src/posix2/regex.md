# Regular expressions

For this exercise you'll want to refer often to a manual for `grep`. 
You can access one on the commandline by invoking `man grep`. 
You've already tackled some problems involving regular expressions in a previous
exercise. Here are some more advanced questions that will require you to
understand more about `grep`, its options, and how regular expression syntax
works.


1. Study the documentation for the `-w` option. Contrive a file such that `grep
   PATTERN FILE` returns two different lines but `grep -w PATTERN FILE` returns
only one line.
2. You'll have seen beforehand that you can count the results of a search with
   `grep PATTERN FILE | wc -l`. However, `grep` also has a `-c` option which
counts matches. Can you find the situation where the `wc -l` approach and the
`-c` approach produce different results? Can you explain why? 
3. Some words have different spelling between British English and American
   English. For example, 'encyclopaedia' is valid in British English but not
American. Can you write a regular expression that would match both of these
words, but nothing else? How about matching both 'color' (American) and 'colour'
(British)?
4. UK postcodes follow a general schema of two letters followed by one number,
   followed by an optional space, then another number, followed by two more letters. Can you write
a regular expression that would match such sequences?
5. In practice, the above is a simplified version of the system, and a better UK
   postcode validator regex is known to be
`^(([A-Z]{1,2}[0-9][A-Z0-9]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA)
?[0-9][A-Z]{2}|BFPO ?[0-9]{1,4}|(KY[0-9]|MSR|VG|AI)[ -]?[0-9]{4}|[A-Z]{2}
?[0-9]{2}|GE ?CX|GIR ?0A{2}|SAN ?TA1)$`. Try breaking apart this monster to
understand what is being tested, and find an example that would match the schema
described for the fourth question but fail to match this expression. 
