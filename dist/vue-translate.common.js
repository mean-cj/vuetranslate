/**
 * VueTranslate plugin v1.2.0
 *
 * Handle basic translations in VueJS
 *
 * This is a plugin to handle basic translations for a component in VueJS. * @author Javis Perez <javisperez@gmail.com>
 * https://github.com/javisperez/vuetranslate
 * Released under the MIT License.
 */

"use strict";

// We need a vue instance to handle reactivity
var vm = null;

// The plugin
var VueTranslate = {
  // Install the method
  install: function(Vue) {
    var _Vue$mixin;

    var version = Vue.version[0];

    if (!vm) {
      vm = new Vue({
        data: function() {
          return {
            current: "",
            locales: {}
          };
        },

        computed: {
          // Current selected language
          lang: function() {
            return this.current;
          },

          // Current locale values
          locale: function() {
            if (!this.locales[this.current]) return null;

            return this.locales[this.current];
          }
        },

        methods: {
          // Set a language as current
          setLang: function(val) {
            if (this.current !== val) {
              if (this.current === "") {
                this.$emit("language:init", val);
              } else {
                this.$emit("language:changed", val);
              }
            }

            this.current = val;

            this.$emit("language:modified", val);
          },

          // Set a locale tu use
          setLocales: function(locales) {
            if (!locales) return;

            var newLocale = Object.create(this.locales);

            for (var key in locales) {
              if (!newLocale[key]) newLocale[key] = {};

              Vue.util.extend(newLocale[key], locales[key]);
            }

            this.locales = Object.create(newLocale);

            this.$emit("locales:loaded", locales);
          },
          text: function(t) {
            if (!this.locale || !this.locale[t]) {
              return t;
            }

            return this.locale[t];
          },
          textWithParams: function(t) {
            var params =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : null;

            if (!this.locale || !this.locale[t]) {
              return t;
            }

            if (
              !this.params ||
              this.params === null ||
              typeof this.params === "undefined"
            ) {
              return t;
            }

            Object.keys(params).forEach(function(key) {
              t = t.replace("%" + key + "%", params[key]);
            });

            return t;
          },
          translator: function(t) {
            if (!this.locale || !this.locale[t]) {
              return t;
            }

            var text = this.locale[t];
            var params =
              arguments.length > 1 && arguments[1] !== undefined
                ? arguments[1]
                : null;

            if (!params) {
              return text;
            }

            Object.keys(params).forEach(function(key) {
              text = text.replace("%" + key + "%", params[key]);
            });

            return text;
          }
        }
      });

      Vue.prototype.$translate = vm;
    }

    // Mixin to read locales and add the translation method and directive
    Vue.mixin(
      ((_Vue$mixin = {}),
      (_Vue$mixin[version === "1" ? "init" : "beforeCreate"] = function() {
        this.$translate.setLocales(this.$options.locales);
      }),
      (_Vue$mixin.methods = {
        // An alias for the .$translate.text method
        t: function(t) {
          return this.$translate.text(t);
        },
        tWithParams: function(t, params) {
          return this.$translate.text(t, params);
        },
        __t: function(t, params) {
          return this.$translate.translator(t, params);
        }
      }),
      (_Vue$mixin.directives = {
        translate: function(el) {
          if (!el.$translateKey) el.$translateKey = el.innerText;

          var text = this.$translate.text(el.$translateKey);

          el.innerText = text;
        }.bind(vm)
      }),
      _Vue$mixin)
    );

    // Global method for loading locales
    Vue.locales = function(locales) {
      vm.$translate.setLocales(locales);
    };

    // Global method for setting languages
    Vue.lang = function(lang) {
      vm.$translate.setLang(lang);
    };
  }
};

if (typeof exports === "object") {
  module.exports = VueTranslate; // CommonJS
} else if (typeof define === "function" && define.amd) {
  define([], function() {
    return VueTranslate;
  }); // AMD
} else if (window.Vue) {
  window.VueTranslate = VueTranslate; // Browser (not required options)
  Vue.use(VueTranslate);
}
