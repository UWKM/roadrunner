Roadrunner - Beep Beep Wagtail
======================

This is our effort to make editing pages with tons of streamfields bloody fast!
Our initial approach is to stick to the original Wagtail as closely as
possible. This means that we have created a new Edit Handler, which provides a
new StreamFieldPanel which you can use to edit your pages. It generates a
complete tree of all the available streamfields and django fields, and together
with the revision json it spits it out to the browser where our JS gets to do
all the heavy lifting.

Whenever you save a page, the editor tries to mimick the POST request that gets
send when the regular Wagtail editor submits. This works right now, but it's
not optimal, because keeping track of all the paths used in the regular editor
is a pain. Therefor I propose we move onto a new setup in the future, where we
simply spit out the json needed in the revision table. This will cut away a lot
of awkward path setups and will make our code more lean. It also opens up the
possibility of moving to a DOMless approach, in which we keep the editor data
seperate, and not locked in a ton of html input tags.

TODOS:
------

- Use thumbnails in the editor (it now pulls in full sized images)
- Add missing fields
- Remove dependency for uwkm-streamfields (but use it when it's available)
