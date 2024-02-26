# Build tools: Python

The Python programming language comes with a package manager called `pip`.  Find the package that provides it and install it (**hint**: how did we find a missing library in the C exercise?).

We are going to practice installing the [mistletoe](https://github.com/miyuchina/mistletoe) module, which renders markdown into HTML.

  - In python, try the line `import mistletoe` and notice that you get `ModuleNotFoundError: No module named 'mistletoe'`. 
  - Quit python again (Control-D) and try `pip3 install --user mistletoe`. You should get a success message (and possibly a warning, explained below).
  - Open python again and repeat `import mistletoe`. This produces no output, so the module was loaded.

Create a small sample markdown file as follows, called `hello.md` for example:

    # Markdown Example

    Markdown is a *markup* language.

Open python again and type the following. You need to indent the last line (four spaces is usual) and press ENTER twice at the end.

    import mistletoe
    with open('hello.md', 'r') as file:
        mistletoe.markdown(file)

This should print the markdown rendered to HTML, e.g.

    <h1>Markdown Example</h1>\n<p>Markdown is a <em>markup</em> language.</p>


|||advanced
Python version 3 came out in 2008 and has some syntax changes compared
to Python 2 (`print "hello world"` became `print("hello
world")`). Version 2 is now considered deprecated; but the transition
was *long* and *extremely painful* because changing the syntax of a
thing like the print statement leads to an awful lot of code breaking
and an awful lot of people preferring not to fix their code and
instead just keep an old version of Python installed.

So whilst we were dealing with this it was typical for a system to
have multiple versions of Python installed `python2` for the old one
and `python3` for the newer on (and even then these were often
symlinks to specific subversions like `python2.6`), and then `python`
being a symlink for whatever your OS considered to be the "supported" version.

Different OSs absolutely had different versions of Python (MacOS was
particularly egregious for staying with Python 2 for far longer than
necessary) and so a solution was needed, because this was just
breaking things while OS designers bickered.

The solution is that for *most* dependencies (except for compiled
libraries) we generally use a programming language's own package
manager and ignore what the OS provides.  For Python that means `pip`
(occasionally called `pip3` or `pip2`).

Sometimes you'll see things telling you to install a package with
`sudo pip install` but don't do that! It will break things horribly
eventually.  You can use pip without sudo, by passing the `--user`
option which installs packages into a folder in your home directory
(`~/.local`) instead of in `/usr` which normally requires root
permissions.

Sometimes you'll still need to install a package through the OSs
package manager (`numpy` and `scipy` are common because they depend on
an awful lot of C code and so are a pain to install with `pip` as you
have to fix the library paths and dependencies manually) but in
general try and avoid it.

Python used to manage your OS should be run by the system designers;
Python used for your dev work should be managed by you.  And never the
twain shall meet.
|||

## Scipy

We often use `scipy` for statistics, so you may as well install that too. Unfortunately, `pip` will not help you here because scipy depends on a C library for fast linear algebra. You could go and install all the dependencies (and you might have to do this if you need a specific version of it), but it turns out Debian has it all packaged up as a system package: Try searching for it with `apt search scipy`.

The following commands show if it is correctly installed, by sampling 5 times from a Normal distribution with mean 200 and standard deviation 10:

    from scipy.stats import norm
    norm(loc=200, scale=10).rvs(5)

This should print an array of five values that are not too far off 200 (to be precise, with about 95% confidence they will be between 180 and 220 - more on this in Maths B later on).

## Avoiding sudo

If you need to install libraries you might be tempted to install them for all users by using `sudo pip` but this can lead to pain!  If you alter the system libraries and something in the system depends on a specific version of a library then it can lead to horrible breakage and things not working (in particular on OSs like Mac OS which tend to update libraries less often).

Python comes with a mechanism called [venv](https://docs.python.org/3/library/venv.html) which lets you create a virtual python install that is owned by a user: you can alter the libraries in that without `sudo` and without fear of mucking up your host system.  Read the docs and get used to using it---it'll save you a world of pain later!

|||advanced
`pip freeze | tee requirements.txt` will list all the packages your using and what version they are and save them in a file called `requirements.txt`.

`pip install -r requirements.txt` will install them again!

This makes it *super easy* to ensure that someone looking at your code has all the right dependencies without having to reel off a list of _go install these libraries_ (and will make anyone whoever has to mark your code happy and more inclined to give you marks).
|||
