/**
 * @file
 * JavaScript behaviors for Telephone element.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  // @see https://github.com/jackocnr/intl-tel-input#options
  Drupal.webform = Drupal.webform || {};
  Drupal.webform.intlTelInput = Drupal.webform.intlTelInput || {};
  Drupal.webform.intlTelInput.options = Drupal.webform.intlTelInput.options || {};

  /**
   * Initialize Telephone international element.
   * @see http://intl-tel-input.com/node_modules/intl-tel-input/examples/gen/is-valid-number.html
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformTelephoneInternational = {
    attach: function (context) {
      if (!$.fn.intlTelInput) {
        return;
      }

      $(context).find('input.js-webform-telephone-international').once('webform-telephone-international').each(function () {
        var $telephone = $(this);

        // Add error message container.
        var $error = $('<strong class="error form-item--error-message">' + Drupal.t('Invalid phone number') + '</strong>').hide();
        $telephone.closest('.js-form-item').append($error);

        var options = {
          // The utilsScript is fetched when the page has finished.
          // @see \Drupal\webform\Plugin\WebformElement\Telephone::prepare
          // @see https://github.com/jackocnr/intl-tel-input
          utilsScript: drupalSettings.webform.intlTelInput.utilsScript,
          nationalMode: false
        };

        // Parse data attributes.
        if ($telephone.attr('data-webform-telephone-international-initial-country')) {
          options.initialCountry = $telephone.attr('data-webform-telephone-international-initial-country');
        }
        if ($telephone.attr('data-webform-telephone-international-preferred-countries')) {
          options.preferredCountries = JSON.parse($telephone.attr('data-webform-telephone-international-preferred-countries'));
        }

        options = $.extend(options, Drupal.webform.intlTelInput.options);
        $telephone.intlTelInput(options);

        var reset = function () {
          $telephone.removeClass('error');
          $error.hide();
        };

        var validate = function () {
          if ($.trim($telephone.val())) {
            if (!$telephone.intlTelInput('isValidNumber')) {
              $telephone.addClass('error');
              var placeholder = $telephone.attr('placeholder');
              var message;
              if (placeholder) {
                message = Drupal.t('The phone number is not valid. (e.g. @example)', {'@example': placeholder});
              }
              else {
                message = Drupal.t('The phone number is not valid.');
              }
              $error.html(message).show();
              return false;
            }
          }
          return true;
        };

        $telephone.on('blur', function () {
          reset();
          validate();
        });

        $telephone.on('keyup change', reset);

        // Check for a valid phone number on submit.
        var $form = $(this.form);
        $form.on('submit', function (event) {
          if (!validate()) {
            $telephone.focus();
            event.preventDefault();

            // On validation error make sure to clear submit the once behavior.
            // @see Drupal.behaviors.webformSubmitOnce
            // @see webform.form.submit_once.js
            if (Drupal.behaviors.webformSubmitOnce) {
              Drupal.behaviors.webformSubmitOnce.clear();
            }
          }
        });
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
;
;
/**
 * @file
 * JavaScript behaviors for Algolia places location integration.
 */

(function ($, Drupal, drupalSettings) {

  'use strict';

  // @see https://github.com/algolia/places
  // @see https://community.algolia.com/places/documentation.html#options
  Drupal.webform = Drupal.webform || {};
  Drupal.webform.locationPlaces = Drupal.webform.locationPlaces || {};
  Drupal.webform.locationPlaces.options = Drupal.webform.locationPlaces.options || {};

  var mapping = {
    lat: 'lat',
    lng: 'lng',
    name: 'name',
    postcode: 'postcode',
    locality: 'locality',
    city: 'city',
    administrative: 'administrative',
    country: 'country',
    countryCode: 'country_code',
    county: 'county',
    suburb: 'suburb'
  };

  /**
   * Initialize location places.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformLocationPlaces = {
    attach: function (context) {
      if (!window.places) {
        return;
      }

      $(context).find('.js-webform-type-webform-location-places').once('webform-location-places').each(function () {
        var $element = $(this);
        var $input = $element.find('.webform-location-places');

        // Prevent the 'Enter' key from submitting the form.
        $input.on('keydown', function (event) {
          if (event.keyCode === 13) {
            event.preventDefault();
          }
        });

        var options = $.extend({
          type: 'address',
          useDeviceLocation: true,
          container: $input.get(0)
        }, Drupal.webform.locationPlaces.options);

        // Add application id and API key.
        if (drupalSettings.webform.location.places.app_id && drupalSettings.webform.location.places.api_key) {
          options.appId = drupalSettings.webform.location.places.app_id;
          options.apiKey = drupalSettings.webform.location.places.api_key;
        }

        var placesAutocomplete = window.places(options);

        // Disable autocomplete.
        $input.attr('autocomplete', 'off');

        // Sync values on change and clear events.
        placesAutocomplete.on('change', function (e) {
          $.each(mapping, function (source, destination) {
            var value = (source === 'lat' || source === 'lng' ? e.suggestion.latlng[source] : e.suggestion[source]) || '';
            setValue(destination, value);
          });
        });
        placesAutocomplete.on('clear', function (e) {
          $.each(mapping, function (source, destination) {
            setValue(destination, '');
          });
        });

        // If there is no default value see if the default value should be set
        // to the browser's current geolocation.
        // @see https://community.algolia.com/places/examples.html#dynamic-form
        if ($input.val() === ''
          && window.navigator.geolocation
          && $input.attr('data-webform-location-places-geolocation')) {

          placesAutocomplete.on('reverse', function (e) {
            var suggestion = e.suggestions[0];
            $input.val(suggestion.value);
            $.each(mapping, function (source, destination) {
              var value = (source === 'lat' || source === 'lng' ? suggestion.latlng[source] : suggestion[source]) || '';
              setValue(destination, value);
            });
          });

          window.navigator.geolocation.getCurrentPosition(function (response) {
            var coords = response.coords;
            var lat = coords.latitude.toFixed(6);
            var lng = coords.longitude.toFixed(6);
            placesAutocomplete.reverse(lat + ',' + lng);
          });
        }

        /**
         * Set attribute value.
         *
         * @param {string} name
         *   The attribute name
         * @param {string} value
         *   The attribute value
         */
        function setValue(name, value) {
          var inputSelector = ':input[data-webform-location-places-attribute="' + name + '"]';
          $element.find(inputSelector).val(value);
        }
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * JavaScript behaviors for multiple element.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Move show weight to after the table.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMultipleTableDrag = {
    attach: function (context, settings) {
      for (var base in settings.tableDrag) {
        if (settings.tableDrag.hasOwnProperty(base)) {
          $(context).find('.js-form-type-webform-multiple #' + base).once('webform-multiple-table-drag').each(function () {
            var $tableDrag = $(this);
            var $toggleWeight = $tableDrag.prev().prev('.tabledrag-toggle-weight-wrapper');
            if ($toggleWeight.length) {
              $toggleWeight.addClass('webform-multiple-tabledrag-toggle-weight');
              $tableDrag.after($toggleWeight);
            }
          });
        }
      }
    }
  };

  /**
   * Submit multiple add number input value when enter is pressed.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMultipleAdd = {
    attach: function (context, settings) {
      $(context).find('.js-webform-multiple-add').once('webform-multiple-add').each(function () {
        var $submit = $(this).find('input[type="submit"], button');
        var $number = $(this).find('input[type="number"]');
        $number.keyup(function (event) {
          if (event.which === 13) {
            // Note: Mousedown is the default trigger for Ajax events.
            // @see Drupal.Ajax.
            $submit.trigger('mousedown');
          }
        });
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for Text format integration.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Enhance text format element.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformTextFormat = {
    attach: function (context) {
      $(context).find('.js-text-format-wrapper textarea').once('webform-text-format').each(function () {
        if (!window.CKEDITOR) {
          return;
        }

        var $textarea = $(this);
        // Update the CKEDITOR when the textarea's value has changed.
        // @see webform.states.js
        $textarea.on('change', function () {
          if (CKEDITOR.instances[$textarea.attr('id')]) {
            var editor = CKEDITOR.instances[$textarea.attr('id')];
            editor.setData($textarea.val());
          }
        });

        // Set CKEDITOR to be readonly when the textarea is disabled.
        // @see webform.states.js
        $textarea.on('webform:disabled', function () {
          if (CKEDITOR.instances[$textarea.attr('id')]) {
            var editor = CKEDITOR.instances[$textarea.attr('id')];
            editor.setReadOnly($textarea.is(':disabled'));
          }
        });

      });
    }
  };

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/
(function ($, Drupal) {
  Drupal.behaviors.filterGuidelines = {
    attach: function attach(context) {
      function updateFilterGuidelines(event) {
        var $this = $(event.target);
        var value = event.target.value;
        $this.closest('.js-filter-wrapper').find('[data-drupal-format-id]').hide().filter("[data-drupal-format-id=\"".concat(value, "\"]")).show();
      }
      $(once('filter-guidelines', '.js-filter-guidelines', context)).find(':header').hide().closest('.js-filter-wrapper').find('select.js-filter-list').on('change.filterGuidelines', updateFilterGuidelines).trigger('change.filterGuidelines');
    }
  };
})(jQuery, Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/
(function ($, Drupal, drupalSettings) {
  function findFieldForFormatSelector($formatSelector) {
    var fieldId = $formatSelector.attr('data-editor-for');
    return $("#".concat(fieldId)).get(0);
  }
  function filterXssWhenSwitching(field, format, originalFormatID, callback) {
    if (format.editor.isXssSafe) {
      callback(field, format);
    } else {
      $.ajax({
        url: Drupal.url("editor/filter_xss/".concat(format.format)),
        type: 'POST',
        data: {
          value: field.value,
          original_format_id: originalFormatID
        },
        dataType: 'json',
        success: function success(xssFilteredValue) {
          if (xssFilteredValue !== false) {
            field.value = xssFilteredValue;
          }
          callback(field, format);
        }
      });
    }
  }
  function changeTextEditor(field, newFormatID) {
    var previousFormatID = field.getAttribute('data-editor-active-text-format');
    if (drupalSettings.editor.formats[previousFormatID]) {
      Drupal.editorDetach(field, drupalSettings.editor.formats[previousFormatID]);
    } else {
      $(field).off('.editor');
    }
    if (drupalSettings.editor.formats[newFormatID]) {
      var format = drupalSettings.editor.formats[newFormatID];
      filterXssWhenSwitching(field, format, previousFormatID, Drupal.editorAttach);
    }
    field.setAttribute('data-editor-active-text-format', newFormatID);
  }
  function onTextFormatChange(event) {
    var select = event.target;
    var field = event.data.field;
    var activeFormatID = field.getAttribute('data-editor-active-text-format');
    var newFormatID = select.value;
    if (newFormatID === activeFormatID) {
      return;
    }
    var supportContentFiltering = drupalSettings.editor.formats[newFormatID] && drupalSettings.editor.formats[newFormatID].editorSupportsContentFiltering;
    var hasContent = field.value !== '';
    if (hasContent && supportContentFiltering) {
      var message = Drupal.t('Changing the text format to %text_format will permanently remove content that is not allowed in that text format.<br><br>Save your changes before switching the text format to avoid losing data.', {
        '%text_format': $(select).find('option:selected')[0].textContent
      });
      var confirmationDialog = Drupal.dialog("<div>".concat(message, "</div>"), {
        title: Drupal.t('Change text format?'),
        dialogClass: 'editor-change-text-format-modal',
        resizable: false,
        buttons: [{
          text: Drupal.t('Continue'),
          class: 'button button--primary',
          click: function click() {
            changeTextEditor(field, newFormatID);
            confirmationDialog.close();
          }
        }, {
          text: Drupal.t('Cancel'),
          class: 'button',
          click: function click() {
            select.value = activeFormatID;
            confirmationDialog.close();
          }
        }],
        closeOnEscape: false,
        create: function create() {
          $(this).parent().find('.ui-dialog-titlebar-close').remove();
        },
        beforeClose: false,
        close: function close(event) {
          $(event.target).remove();
        }
      });
      confirmationDialog.showModal();
    } else {
      changeTextEditor(field, newFormatID);
    }
  }
  Drupal.editors = {};
  Drupal.behaviors.editor = {
    attach: function attach(context, settings) {
      if (!settings.editor) {
        return;
      }
      once('editor', '[data-editor-for]', context).forEach(function (editor) {
        var $this = $(editor);
        var field = findFieldForFormatSelector($this);
        if (!field) {
          return;
        }
        var activeFormatID = editor.value;
        field.setAttribute('data-editor-active-text-format', activeFormatID);
        if (settings.editor.formats[activeFormatID]) {
          Drupal.editorAttach(field, settings.editor.formats[activeFormatID]);
        }
        $(field).on('change.editor keypress.editor', function () {
          field.setAttribute('data-editor-value-is-changed', 'true');
          $(field).off('.editor');
        });
        if ($this.is('select')) {
          $this.on('change.editorAttach', {
            field: field
          }, onTextFormatChange);
        }
        $this.parents('form').on('submit', function (event) {
          if (event.isDefaultPrevented()) {
            return;
          }
          if (settings.editor.formats[activeFormatID]) {
            Drupal.editorDetach(field, settings.editor.formats[activeFormatID], 'serialize');
          }
        });
      });
    },
    detach: function detach(context, settings, trigger) {
      var editors;
      if (trigger === 'serialize') {
        editors = once.filter('editor', '[data-editor-for]', context);
      } else {
        editors = once.remove('editor', '[data-editor-for]', context);
      }
      editors.forEach(function (editor) {
        var $this = $(editor);
        var activeFormatID = editor.value;
        var field = findFieldForFormatSelector($this);
        if (field && activeFormatID in settings.editor.formats) {
          Drupal.editorDetach(field, settings.editor.formats[activeFormatID], trigger);
        }
      });
    }
  };
  Drupal.editorAttach = function (field, format) {
    if (format.editor) {
      Drupal.editors[format.editor].attach(field, format);
      Drupal.editors[format.editor].onChange(field, function () {
        $(field).trigger('formUpdated');
        field.setAttribute('data-editor-value-is-changed', 'true');
      });
    }
  };
  Drupal.editorDetach = function (field, format, trigger) {
    if (format.editor) {
      Drupal.editors[format.editor].detach(field, format, trigger);
      if (field.getAttribute('data-editor-value-is-changed') === 'false') {
        field.value = field.getAttribute('data-editor-value-original');
      }
    }
  };
})(jQuery, Drupal, drupalSettings);;
