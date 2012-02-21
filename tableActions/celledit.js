(function($) {
	// editing initializer
	$.fn.celledit = function(options)
	{
		options = $.extend({}, $.fn.celledit.defaults, options);
		return this.each(function(){
			$(this).celleditField(options);
		});
	}

	$.celleditOptions = function(options)
	{
		$.fn.celledit.defaults = $.extend({}, $.fn.celledit.defaults, options);
	}

	// single field editing object
	$.fn.celleditField = function(options)
	{
		var self = this;
		var field = $(this);

		self.init = function()
		{
			if($(self).data('celleditInited')){ return false; }
			$(self).data('celleditInited',1);

			// edit action
			field.click(self.editCell);

			// add editing hint
			field.mouseenter(self.addCanEditHint);
			field.mouseleave(self.oddCanEditHint);

			field.attr('title','Click to edit');
			// make title nice
			(typeof($.fn.tooltip)=='function')&&field.tooltip({fade:1,showTimeout:options.canEditHintTimeout});
		}

		/**
		 * editing field functions
		 */
		self.editCell = function()
		{
			// FIXME disable should be make in another way
			if(field.parent().data('disable_celledit')){ return false; }

			if(field.data('editing'))
			{
				// field already in editing mode
				return;
			}
			field.data('editing',true);
			self.oddCanEditHint(); // hide editing hint

			// get current value
			var value=field.text();
			field.data('srcValue',value);
			if(options.type == 'checkbox')
			{
				value = value.toLowerCase();
				value = (value == 'yes')
					|| (value == '1')
					|| (value == 'on')
					|| (value == 'enabled');
			}
			// detect primary key
			var primaryId=options.iddetect(field);
			if(typeof(primaryId) == 'undefined' || !primaryId)
			{
				(typeof(console)!='undefined')&&console.error(field,'Can not find primary id value!');
			}
			field.data('primaryIdValue', primaryId);

			// add editing field
			var efiled=null;
			if(options.type == 'textarea')
			{
				efiled=$('<textarea></textarea>');
				efiled.text(value);
			}
			else if(options.type == 'checkbox')
			{
				efiled=$('<input>');
				efiled.attr('type','checkbox')
					.attr('checked',value);
			}
			else if(options.type == 'select')
			{
				if(typeof(options.selectOptions) == 'undefined' || !options.selectOptions)
				{
					(typeof(console)!='undefined')&&console.error(field,options,'selectOptions not specified for select type!');
				}

				// add select option
				efiled=$('<select></select>');

				for(var i in options.selectOptions) {
					var item=options.selectOptions[i];
					var opt=$('<option></option>');
					if(typeof(item) == 'object')
					{
						opt.html(item.html).val(item.val);
						if(((typeof(item.html)=='string') ? item.html.toLowerCase() : item.html)
							== ((typeof(value)=='string') ? value.toLowerCase() : value) ){ opt.attr('selected',true); }
					}
					else
					{
						opt.html(item).val(item);
						if(((typeof(item)=='string') ? item.toLowerCase() : item)
							== ((typeof(value)=='string') ? value.toLowerCase() : value) ){ opt.attr('selected',true); }
					}
					efiled.append(opt);
				}
			}
			else if(options.type == 'datetime')
			{
				efiled=$('<input>');
				efiled.attr('type','text')
					.val(value);

				// init date picker
				efiled.datetimepicker({
						showSecond: true,
						timeFormat: 'hh:mm:ss',
						dateFormat: 'yy-mm-dd',
						stepHour: 1,
						stepMinute: 5,
						stepSecond: 5
				});
			}
			else// defalt is (options.type == 'text')
			{
				efiled=$('<input>');
				efiled.attr('type','text')
					.val(value);
			}

			// apply custom css to filed
			if(typeof(options.fieldCss) != 'undefined')
			{
				efiled.css(options.fieldCss);
			}

			// create save and cancel buttons
			var esave=$('<input>');
			esave.attr('type','image')
					.attr('src',options.btnImgSave)
					.click(self.saveCell);

			var ecancel=$('<input>');
			ecancel.attr('type','image')
					.attr('src',options.btnImgCancel)
					.click(self.cancelEdit);

			field.fadeOut('fast',function(){
				field.html(efiled);
				field.append(esave);
				field.append(ecancel);
				field.fadeIn('fast');

				// setup focus
				efiled.focus();

				// add key bindings
				efiled.bind('keypress', function(key) {
					//disable save by enter for textarea
					if($(this).attr('type') != 'textarea' && key.keyCode == 13) //enter pressed
					{
						self.saveCell();
					}
					else if(key.keyCode == 27) //esc pressed
					{
						self.cancelEdit();
					}
				});
			});
		};

		self.saveCell = function()
		{
			if(field.data('saving'))
			{
				// field already in saving mode
				return;
			}
			field.data('saving',true);

			var efield = field.find('input[type!=image], select, textarea').first();
			var value=efield.val();
			if(efield.attr('type') == 'checkbox')
			{
				value = efield.attr('checked');
			}
			else if(efield.attr('type') == 'radio')
			{
				//TODO test this
				value = $('[checked!=false]',efield).attr('value');
			}

			if (options.callbackBeforeSave != 'undefined')
			{
				value = options.callbackBeforeSave(value);
			}

			var becomeEdit=function(msg)
			{
				field.hideAjaxloader(function(){
					if(typeof(msg) == 'undefined' || !msg){ msg = 'Save failed x_X'; }
					self.message(msg);
				});
			}

			field.showAjaxloader('inner',options.ajaxLoaderType);
			var postData = {
				field_name: options.servFieldName,
				field_value: value,
				format: 'json'
			};
			postData[options.servPrimaryIdName] = field.data('primaryIdValue');
			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: options.servUrl,
				data: postData,
				success: function(res)
				{
					if(res.code > 0) {
						field.hideAjaxloader(function(){
							var setValue = value;
							if(typeof(res.value) != 'undefined')
							{
								setValue = res.value;
							}
							if (options.callbackAfterSave != 'undefined')
							{
								value = options.callbackAfterSave(setValue);
							}
							field.text(setValue);
						});
						field.data('editing',false);
						self.message('Saved!');
					} else {
						var msg = '';
						if(typeof(res.message) != 'undefined')
						{
							msg = res.message;
						}
						// save failed, come to edit mode
						becomeEdit(msg);
					}
				},
				error: function(oxmlreq, msg){
					becomeEdit('Error in transfer: '+msg);
				},
				complete: function(){
					field.data('saving',false);
				}
			});
		};

		self.cancelEdit = function()
		{
			field.fadeOut('fast',function(){
				field.text(field.data('srcValue'));
				field.fadeIn('fast',function(){
					field.data('editing',false);
				});
			});
			return false; // stop parse parent click event
		};

		/**
		 * edit hints functions
		 */
		self.addCanEditHint = function()
		{
			if(
				!options.canEditHintTimeout || // not if timeout is null
				field.data('editing') // not if editing mode
			){ return; }

			field.data('canEditHintTimer', setTimeout(
				function(){
					field.css({background:'url('+options.btnImgEdit+') right top no-repeat'});
				},
				options.canEditHintTimeout
			));
		};
		self.oddCanEditHint = function()
		{
			if(!options.canEditHintTimeout){ return; } // not if timeout is null

			// remove timer and hide hint
			if(field.data('canEditHintTimer'))
			{
				clearTimeout( field.data('canEditHintTimer') );
				field.data('canEditHintTimer',null);

				field.css({background:''});
			}
		};

		self.message = function(msg)
		{
			$.jGrowl(msg, {header: 'Information:', life: 10000});
		};

		self.init();
	};

	$.fn.celledit.defaults = {
		type			: 'text',	// default edit type (text,checkbox,textarea,select,datetime)
		iddetect		: function(x){return $(x).attr('primaryId');},		// detect primary id callback function
		selectOptions	: null,		// options for select, can be array of keys OR array of {val:optionValue,html:optionInner}

		callbackBeforeSave : function(value)    { return value; },
		callbackAfterSave : function(value)     { return value; },

		canEditHintTimeout	: 400, // 0 - for disable
		btnImgEdit			: '/images/cog_edit.png',
		btnImgSave			: '/images/save.gif',
		btnImgCancel		: '/images/cross.gif',

		ajaxLoaderType		: 'bars',

		servUrl					: '?',		// server url to send, must return {code:1} or {code:0,message:'user message'}
		servPrimaryIdName		: 'id', 	// default primary key name to send to server
		servFieldName			: 'var'		// default var name to send to server
	};
})(jQuery);
