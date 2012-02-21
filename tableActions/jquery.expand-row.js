(function($) {
	// editing initializer
	$.fn.expandRows = function(options)
	{
		options = $.extend({}, $.fn.expandRows.defaults, options);
		return this.each(function(){
			$(this).expandRow(options);
		});
	}

	$.expandRowsOptions = function(options)
	{
		options = $.extend({}, $.fn.expandRows.defaults, options);

		$.fn.expandRows.defaults = $.extend({}, $.fn.expandRows.defaults, options);
	}

	// single field editing object
	$.fn.expandRow = function(options)
	{
		var self = this;
		var field = $(this);
		var container = null;       //here will be store new container
		
		//try to find parent row
		if (typeof(options.detectParentRow) == 'undefined')
		{
			consoleError(field, 'Could not detect parent row!');
			return;
		}
		var parentRow = options.detectParentRow(field);
		if (parentRow.length < 1)
		{
			consoleError(field, 'Parent row not founded!');
			return;
		}

		self.init = function()
		{
			if($(self).data('expandRowInited')){ return false; }
			$(self).data('expandRowInited',1);

			// edit action
			field.click(self.expandClicked);

			// add editing hint
			field.mouseenter(self.addCanEditHint);
			field.mouseleave(self.oddCanEditHint);
		}

		self.expandClicked = function()
		{
			if (field.data('processing') == 1)
			{
				return;
			}
			field.data('processing',1);

			if (container)
			{
				//already expanded, hide it
				callbackHide = function()
				{
					$(this).remove();
					if (options.changeLabelFlag && typeof(options.labelToExpand) != 'undefined')
					{
						field.text(options.labelToExpand);
					}
					field.data('processing',0);
					container = null;
				}
				if (typeof(options.effectHide) != 'undefined')
					options.effectHide(container, callbackHide);      //if custom hide effect defined, use it
				else
					$(container).slideUp('slow', callbackHide);          //if not - use default
			}
			else
			{
				//create ajax container for display loading information
				container = (typeof(options.ajaxContainer) == 'undefined') ? $('<td></td>') : $(options.ajaxContainer);
				if ($('td', parentRow.parents('tbody')).length)
				{
					$('td',container).attr('colspan', $('td', parentRow).length);      //setup colspan = numbers of <td> in parent row if founded
				}
				$(container).insertAfter(parentRow);

				$(container).showAjaxloader('inner', options.ajaxLoaderType);

				if (typeof(options.callbackBeforeLoad) != 'undefined')
							container = options.callbackBeforeLoad(container, parentRow);

				postData = $.extend({}, options.requestData)
				postData[ options.servPrimaryIdName] = options.detectPrimaryId(field);
				
				if (options.callbackFetchData && typeof(options.callbackFetchData) == 'function')
					options.callbackFetchData(postData, self.expandData);
				else
					$.ajax({
						url: options.servUrl,
						type: options.servType,
						data: postData,
						success: function(result)
						{
							self.expandData(result)
						},
						error: function(xmlhttpreq, textStatus) {
							field.data('processing',0);
						},
						complete: function(xmlhttpreq, textStatus){
						}
					});
			}
		}
		
		self.expandData = function(result)
		{
			if (container)
				container.remove();

			container = $(result);
			$(container).insertAfter(parentRow);
			container.each(function(){
				if (this.nodeType != 1) return false;
				if ($(this).hidden) return false;
				$(this).hide()
			});

			if (typeof(options.callbackAfterLoad) != 'undefined')
				container = options.callbackAfterLoad(container, parentRow);
			if (typeof(options.turnHandlers) != 'undefined' && options.turnHandlers)
			{
				var elems = options.turnHandlers(container);
				if (elems)
					elems.each(function(){
						$(this).click(self.expandClicked);
					});
			}

			var callbackShow = function()
			{
				if (options.changeLabelFlag && typeof(options.labelToTurn) != 'undefined')
				{
					field.text(options.labelToTurn);
				}
				field.data('processing',0);
			}
			if (typeof(options.effectShow) != 'undefined')
				options.effectShow(container, callbackShow);       //if custom hide effect defined, use it
			else
				container.slideDown('slow', callbackShow);         //if not - use defaults
		}

		self.message = function(msg)
		{
			var messanger = new sMsg();
			messanger.add(msg, 'info');
		};

		self.init();
	};

	$.fn.expandRows.defaults = {
		callbackBeforeLoad : function(row, parentRow)    { return row; },
		callbackAfterLoad : function(row, parentRow)     { return row; },

		callbackFetchData : null,       // function(requestData, callbackFunction)        //callback for fetching data, instead standard method

		labelToExpand : '[+]',
		labelToTurn : '[-]',

		changeLabelFlag : false,

		turnHandlers : function(row) {
			//return jquery object of html elements, what can turn expanded row
			return false;
		},

		ajaxContainer : '<tr><td></td></tr>',

		detectParentRow : function(field) {
			return field.parent('tr');
		},
		detectPrimaryId : function(field) {
			return field.text();
		},

		effectHide : function(row, callback)
		{
			row.hide('slow', callback)
		},
		effectShow : function(row, callback)
		{
			row.show('slow', callback)
		},

		ajaxLoaderType		: 'bars',

		servUrl					: '?',		// server url to send, must return {code:1} or {code:0,message:'user message'}
		servType                : 'post',
		servPrimaryIdName		: 'id', 	// default primary key name to send to server
		requestData             : {}
	};
})(jQuery);
