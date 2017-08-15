# Always prefer setuptools over distutils
from setuptools import setup, find_packages
# To use a consistent encoding
from codecs import open
from os import path

here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='roadrunner',

    # Versions should comply with PEP440.  For a discussion on single-sourcing
    # the version across setup.py and the project code, see
    # https://packaging.python.org/en/latest/single_source_version.html
    version='0.0.1',

    description='Alternative StreamFieldPanel for Wagtail',
    long_description=long_description,

    # The project's main homepage.
    url='https://github.com/UWKM/roadrunner/',
    branch_url='https://github.com/UWKM/roadrunner/tree/master',
    download_url='https://github.com/UWKM/roadrunner/archive/master.zip',

    # Author details
    author='UWKM',
    author_email='support@uwkm.nl',

    # Choose your license
    license='BSD3',
    include_package_data=True,
    packages=find_packages(),

    # See https://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[],

    # What does your project relate to?
    keywords='wagtail cms streamfields uwkm',

    # Alternatively, if you want to distribute just a my_module.py, uncomment
    # this:
    #   py_modules=["my_module"],

    # List run-time dependencies here.  These will be installed by pip when
    # your project is installed. For an analysis of "install_requires" vs pip's
    # requirements files see:
    # https://packaging.python.org/en/latest/requirements.html
    install_requires=[
        'wagtail>=1.10',
        'wagtailfontawesome',
        'uwkm_streamfields',
    ],

    # List additional groups of dependencies here (e.g. development
    # dependencies). You can install these using the following syntax,
    # for example:
    # $ pip install -e .[dev,test]
    extras_require={
    },
)
