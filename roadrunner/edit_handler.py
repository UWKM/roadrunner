import hashlib
import json
import pprint
from django.utils.translation import ugettext_lazy
from django.utils.safestring import mark_safe
from django.template.loader import render_to_string
from wagtail.utils.decorators import cached_classmethod

from wagtail.wagtailadmin.edit_handlers import BaseFieldPanel
from uwkm_streamfields.models import StreamfieldsSettings as settings

class BaseUwkmStreamFieldPanel(BaseFieldPanel):
    choiceTable = {}

    def __init__(self, instance=None, form=None):
        super(BaseFieldPanel, self).__init__(instance=instance, form=form)
        self.bound_field = self.form[self.field_name]

        self.heading = self.bound_field.label
        self.help_text = self.bound_field.help_text

    def classes(self):
        classes = super(BaseUwkmStreamFieldPanel, self).classes()
        classes.append("stream-field")

        # In case of a validation error, BlockWidget will take care of outputting the error on the
        # relevant sub-block, so we don't want the stream block as a whole to be wrapped in an 'error' class.
        if 'error' in classes:
            classes.remove("error")

        return classes

    @classmethod
    def html_declarations(cls):
        return ""
        #return cls.block_def.all_html_declarations()

    @classmethod
    def get_comparison_class(cls):
        return compare.StreamFieldComparison


    # Generate a tree from a given StreamBlock, containing all the underlying
    # fields. Updates self.choiceTable in the process
    def generateStreamTree(self, block):
        tree = {
            'name': block.name,
            'def': block.definition_prefix,
            'label': '',
            'icon': '',
            'type': block.__class__.__name__,
            'field': {},
            'children': [],
        }

        child_blocks = []

        # Try to retrieve icon/label from _constructor_args
        if hasattr(block, '_constructor_args'):
            if len(block._constructor_args) > 1:
                args = block._constructor_args[1]
                if 'icon' in args:
                    tree['icon'] = args['icon']
                if 'label' in args:
                    tree['label'] = args['label']
                else:
                    tree['label'] = block.label

        # If a block has only one child, try to soak up the data
        # and then move on to processing the children of that child
        if hasattr(block, 'child_block'):
            if hasattr(block.child_block, 'child_blocks'):
                child_blocks = block.child_block.child_blocks
                if block.child_block.__class__.__bases__[0].__name__ == 'StructBlock':
                    # the single child who's blocks we have soaked up is
                    # actually a struct
                    tree['hasStruct'] = True
            else:
                child_blocks = {block.child_block.name: block.child_block}
        elif hasattr(block, 'child_blocks'):
            child_blocks = block.child_blocks

        # Add field information if this is, or extends a "primitive" field
        if hasattr(block, 'field'):
            fieldsToGrab = ['initial', 'required', 'help_text', 'min_value',
                'max_value', 'disabled', 'stip', 'min_length', 'max_length',
                'empty_value', 'default']
            tree['field']['type'] = block.field.__class__.__name__

            for field in fieldsToGrab:
                if (
                    hasattr(block.field, field) and
                    getattr(block.field, field) not in [False, '', None]
                ):
                    tree['field'][field] = getattr(block.field, field)

            # Check if we're dealing with a choice field, in that case we have to
            # update the choices table. We're using this table because we want
            # to avoid duplicating data we send to the browser.
            if hasattr(block.field, '_choices'):
                tmp = []
                for key,val in block.field._choices:
                    tmp.append([str(key), str(val)])

                choicesHash = hashlib.md5(str(tmp).encode('utf-8')).hexdigest()

                if choicesHash not in self.choiceTable:
                    self.choiceTable[choicesHash] = tmp

                tree['field']['choices'] = choicesHash

        # Delete some empty fields to tighten our json in the end
        deleteIfEmpty = ['label', 'icon']
        for item in deleteIfEmpty:
            if tree[item] == '':
                del tree[item]

        # Delete field if it's empty
        if not tree['field']:
            del tree['field']

        for childName in child_blocks:
            tree['children'].append(self.generateStreamTree(child_blocks[childName]))

        # Delete children if it's empty
        if len(tree['children']) == 0:
            del tree['children']

        if block.__class__.__bases__[0].__name__ == 'StructBlock':
            tree['struct'] = True

        return tree

    def getStreamTree(self):
        parentBlock = getattr(self.model, self.field_name).field.stream_block
        return self.generateStreamTree(parentBlock)

    def render_as_object(self):
        revision = self.instance.get_latest_revision()
        currentJson = 'false'

        if revision is not None:
            currentJson = revision.content_json

        tree = self.getStreamTree()
        tree['name'] = self.field_name

        # If there are errors we set the errorFlag with a constant. We're doing
        # AJAX submits in wagtail, and since we always get a 2xx http status
        # regardless of the actual errors that might have occured, we need this
        # flag as a workaround. We simply search the resulting HTML we get
        # after a submit for this flag and if it's not there, we submit it
        # again, but then without using AJAX.
        errorText = self.form._errors.as_text()
        errorFlag = ''
        if errorText != '':
            errorFlag = '{{PAGE_HAS_ERRORS}}'


        colors = '#000000,#FFFFFF'
        try:
            colorList = (
                settings.objects.first()
                .pre_selected_colors.strip()
                .replace('\r', '').replace('\n', '')
                .replace(' ', '').split(';')
            )
            colors = ','.join(colorList[:7])
        except:
            pass

        context = {
            'tree':       json.dumps(tree),
            'choices':    str(self.choiceTable),
            'json':       currentJson,
            'errors':     json.dumps('content' in self.form._errors),
            'error_flag': errorFlag,
            'error_text': errorText,
            'colors':     json.dumps(colors),
        }

        return mark_safe(render_to_string('streameditor.html', context))

    def id_for_label(self):
        # a StreamField may consist of many input fields, so it's not meaningful to
        # attach the label to any specific one
        return ""

class UwkmStreamFieldPanel(object):
    def __init__(self, field_name, classname=''):
        self.field_name = field_name
        self.classname = classname

    def bind_to_model(self, model):
        return type(str('_UwkmStreamFieldPanel'), (BaseUwkmStreamFieldPanel,), {
            'model': model,
            'field_name': self.field_name,
            'block_def': model._meta.get_field(self.field_name).stream_block,
            'classname': self.classname,
        })
