/**
 * Module for deleting row from table.
 * Can be handled for any table.
 */

(function($) {
	// editing initializer
	$.fn.rowdelete = function(options)
	{
		options = $.extend({}, $.fn.rowdelete.defaults, options);
		$.rowdeleteOptions(options);
		return this.each(function() {
			$(this).rowdeleteField(options);
		});
	}

	$.rowdeleteOptions = function(options)
	{
		$.fn.rowdelete.defaults = $.extend({}, $.fn.rowdelete.defaults, options);
	}

	// single field editing object
	$.fn.rowdeleteField = function(options)
	{
		var self = this;
		var field = $(this);
		var primaryId=options.iddetect(field);

		self.init = function()
		{

			// add delete buttons
			field.mouseenter(self.addCanDeleteButton);
			field.mouseleave(self.oddCanDeleteButton);
		}

		var becomeEdit=function(msg)
		{
			self.message(msg);
//			field.hideAjaxloader(function() {
//				if(typeof(msg) == 'undefined' || !msg){ msg = 'Save failed x_X'; }
//				self.message(msg);
//			});
		}

		self.message = function(msg)
		{
			$.jGrowl(msg, {header: 'Information:', life: 10000});
		};

		self.rowDelete = function()
		{
			if (!confirm('Are you sure that you want to delete this row?'))
			{
				return false;
			}
			primaryId=options.iddetect(field);
			postData = {
				format: 'json'
			};
			postData[options.servPrimaryIdName] = primaryId;

			//create container for ajax loader
			var ajaxContainer = $('<div>');
			ajaxContainer.css({
				position: 'absolute',
				top: field.position().top,
				left: field.position().left+field.width()+30
			});
			$('body').append(ajaxContainer);
			ajaxContainer.showAjaxloader('inner','bars');
			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: options.servUrl,
				data: postData,
				success: function(res)
				{
					if(res.code > 0) {
						field.fadeOut(function() {
							$(this).remove();
						});
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
					ajaxContainer.remove();
				}
			});
		}

		/**
		 * edit hints functions
		 */
		self.addCanDeleteButton = function()
		{
			if(
				!options.canDeleteHintTimeout || // not if timeout is null
				field.data('editing') // not if editing mode
			){ return; }

			field.data('canDeleteHintTimer', setTimeout(
				function(){
					var delBtn = $('<input>');
					delBtn.attr('type','image').attr('src',options.btnImgDelete).css({
						position: 'absolute',
						top: field.position().top,
						left: field.position().left+field.width()
					}).attr('delBtnId',primaryId).hide().click(self.rowDelete)
					.attr('title','Click to delete this row!');
					// make title nice
					(typeof($.fn.tooltip)=='function')&&delBtn.tooltip({fade:1,showTimeout:options.canDeleteHintTimeout});
					$('body').append(delBtn);
					delBtn.fadeIn();
				},
				options.canDeleteHintTimeout
			));
		};

		self.oddCanDeleteButton = function()
		{
			if(!options.canDeleteHintTimeout){ return; } // not if timeout is null
			setTimeout(function() {
				// remove timer and hide hint
				if(field.data('canDeleteHintTimer'))
				{
					clearTimeout( field.data('canDeleteHintTimer') );
					field.data('canDeleteHintTimer',null);

					$('input[delBtnId='+primaryId+']').fadeOut(function() {
						$(this).remove();
					});
				}
			}, options.btnDeleteHideAfter);		//hide button after 2 sec
		};

		self.init();
	};

	$.fn.rowdelete.defaults = {
		iddetect		: function(x){return $(x).attr('primaryId');},		// detect primary id callback function

		canDeleteHintTimeout	: 400, // 0 - for disable
		btnDeleteHideAfter		: 2000,	// hide delete button after X milliseconds
		btnImgDelete		    : '/images/cross.gif',

		servUrl					: '?',		// server url to send, must return {code:1} or {code:0,message:'user message'}
		servPrimaryIdName		: 'id' 	// default primary key name to send to server
	};
})(jQuery);
