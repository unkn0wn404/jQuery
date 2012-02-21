(function($) {
	// editing initializer
	$.fn.rowedit = function(options, rows)
	{
		options = $.extend({}, $.fn.rowedit.defaults, options);
		if (rows)
		{
			$.roweditRows(rows);
		}
		options.rows = $.fn.rowedit.rows;
		$.celleditOptions(options);
		return this.each(function() {
			$(this).roweditField(options);
		});
	}

	$.roweditOptions = function(options)
	{
		$.fn.rowedit.defaults = $.extend({}, $.fn.rowedit.defaults, options);
	}

	$.roweditRows = function(rows)
	{
		$.fn.rowedit.rows = rows;
	}

	// single field editing object
	$.fn.roweditField = function(options)
	{
		var self = this;
		var rowField = $(this);

		var cellCounter=0;
		options.cellsdetect(rowField).each(function(){
			field = $(this);

			//detect options for current field
			if (options.rows[cellCounter])
			{
				cellOptions = options.rows[cellCounter];
				cellCounter++;
			}
			else
			{
				//if no current item, get last row config
				cellOptions = options.rows[options.rows.length-1];
			}
			if (cellOptions['type'] == 'null') { return; }
			$.celleditOptions(cellOptions);
			field.celledit();
		});
	};

	$.fn.rowedit.rows = [
		{
			type			: 'text',
			fieldNameDetect : function(x){return $(x).attr('class');},
			selectOptions	: null		// options for select, can be array of keys OR array of {val:optionValue,html:optionInner}
		}
	];
	
	$.fn.rowedit.defaults = {
		iddetect		: function(x){return $(x).attr('primaryId');},		// detect primary id callback function
		cellsdetect		: function(x){return $(x).find('td');},

		canEditHintTimeout	: 400, // 0 - for disable
		btnImgEdit			: '/images/cog_edit.png',
		btnImgSave			: '/images/save.gif',
		btnImgCancel		: '/images/cross.gif',

		servUrl					: '?',		// server url to send, must return {code:1} or {code:0,message:'user message'}
		servPrimaryIdName		: 'id' 	// default primary key name to send to server
	};
})(jQuery);
