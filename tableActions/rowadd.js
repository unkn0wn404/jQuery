/**
 * Module for adding row to table by pattern of fields
 *
 * Example of use:
 * extendInfoRows = [
		{
			type            : 'text',
			servFieldName   : 'field',
			title           : 'Field name',
			fieldCss        : {width:100}
		},
		{
			type            : 'text',
			servFieldName   : 'value',
			title           : 'Field value',
			fieldCss        : {width:100}
		}
	];
   extendInfoAddOptions = {
		servUrl:  '/products/extendadd/product_id/'+prodId+'/',
		callbackAdd: function(data) {
			trAdded = $('<tr></tr>');
			$('table.pextend').append(trAdded);
			trAdded.hide();
			trAdded.append('<td class="extend-info-name">'+data.field+'</td>');
			trAdded.append('<td class="extend-info-value">'+data.value+'</td>');

			//set handles
			trAdded.rowedit(extendInfoEditOptions, extendInfoRows);
			trAdded.rowdelete(extendInfoDeleteOptions);

			trAdded.fadeIn();
		}
	};
 $('#img_add_new_extend').rowadd(extendInfoAddOptions, $.extend(true, extendInfoRows,[
														{fieldCss:	{width:300}},
														{fieldCss:	{width:300}}
													]));
 In this example will be added 2 fields with names field & value - input of type text with
 labels 'Field name' & 'Field value'. Values fieldCss : {width:100} what setted in the top example using for editing
 {fieldCss:	{width:300}} will be used for add row and actually rewrite top-declarated param of this options.
 Finally, action 'add row' will be binded to element with id #img_add_new_extend
 Option 'callbackAdd' in extendInfoAddOptions set callback function, what will be called after row will be added on server
 and receive as his parameter server answer with row data.
 */

(function($) {
	// editing initializer
	$.fn.rowadd = function(options, rows)
	{
		options = $.extend({}, $.fn.rowadd.defaults, options);
		$.rowaddRows(rows);
		
		options.rows = $.fn.rowadd.rows;
		$.rowaddOptions(options);
		return this.each(function() {
			$(this).rowaddFields(options);
		});
	}

	$.rowaddRows = function(rows)
	{
		$.fn.rowadd.rows = rows;
	}
	
	$.rowaddOptions = function(options)
	{
		$.fn.rowadd.defaults = $.extend({}, $.fn.rowadd.defaults, options);
	}

	// single field editing object
	$.fn.rowaddFields = function(options)
	{
		var self = this;
		var field = $(this);

		self.init = function()
		{
			field.click(self.add);
		}

		var becomeEdit=function(msg)
		{
			self.message(msg);
		}

		self.add = function() 
		{
			field.attr('disabled', 'disabled');
			field.showAjaxloader('after','bars');
			//generate form
			form = $('<form></form>');
			form.attr('action',options.servUrl).attr('method','post');

			for (i1 in options['rows'])
			{
				var row = options['rows'][i1];

				var efiled=null;
				if(row.type == 'null')
				{
					continue;
				}
				else if(row.type == 'textarea')
				{
					efiled=$('<textarea></textarea>');
					efiled.attr('name',row.servFieldName);
					efiled.text( (row['value']?row['value']:'') );
				}
				else if(row.type == 'checkbox')
				{
					efiled=$('<input>');
					efiled.attr('name',row.servFieldName);
					efiled.attr('type','checkbox');
					efiled.attr('checked',(row['value']?1:0));
				}
				else if(row.type == 'select')
				{
					if(typeof(row.selectOptions) == 'undefined' || !row.selectOptions)
					{
						(typeof(console)!='undefined')&&console.error(field,row,'selectOptions not specified for select type!');
					}

					// add select option
					efiled=$('<select></select>');
					efiled.attr('name',row.servFieldName);
					
					for(var i in row.selectOptions) {
						var item=row.selectOptions[i];
						var opt=$('<option></option>');
						if(typeof(item) == 'object')
						{
							opt.html(item.html).val(item.val);
							if(((typeof(item.html)=='string') ? item.html.toLowerCase() : item.html)
								== ((typeof(row.value)=='string') ? row.value.toLowerCase() : row.value) ){ opt.attr('selected',true); }
						}
						else
						{
							opt.html(item).val(item);
							if(((typeof(item)=='string') ? item.toLowerCase() : item)
								== ((typeof(row.value)=='string') ? row.value.toLowerCase() : row.value) ){ opt.attr('selected',true); }
						}
						efiled.append(opt);
					}
				}
				else if(row.type == 'datetime')
				{
					efiled=$('<input>');
					efiled.attr('name',row.servFieldName);
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
				else// default is (row.type == 'text')
				{
					efiled=$('<input>');
					efiled.attr('name',row.servFieldName);
					efiled.attr('type','text')
						.val((row['value']?row['value']:''));
				}
				// apply custom css to filed
				if(typeof(row.fieldCss) != 'undefined')
				{
					efiled.css(row.fieldCss);
				}

				if (row.title)
				{
					form.append('<label>'+row.title+'</label><br />');
				}
				form.append(efiled);
				form.append('<br />');
			}
			form.append('<input type="submit" name="submit" value="Add" />');
			$('input:submit',form).click(self.saveFromForm);
			field.removeAttr('disabled');
			field.hideAjaxloader();
			var fbox = $.fancybox({
				'titlePosition'		: 'inside',
				'content'			: form
			});
		}

		self.saveFromForm = function()
		{
			$(this).showAjaxloader('after','bars');
			var form = $(this).parent('form');
			postData = {format: 'json'};
			for (i1 in options['rows'])
			{
				var row = options['rows'][i1];
				if (row.type == 'null') continue;
				
				elem = $('[name='+row.servFieldName+']',form);
				if (typeof elem != undefined)
				{
					postData[row.servFieldName] = elem.val();
					if (elem.is('input:checkbox'))
					{
						postData[row.servFieldName] = (elem.is(':checked') ? 1 : 0);
					}
				}
			}

			$.ajax({
				type: 'POST',
				dataType: 'json',
				url: options.servUrl,
				data: postData,
				success: function(res)
				{
					if(res.code > 0) {
						field.hideAjaxloader(function(){
							var setValue = res.value;
							if(typeof(res.value) != 'undefined')
							{
								setValue = res.value;
							}
							field.text(setValue);
						});
						$.fancybox.close();
						options.callbackAdd(res.data);
						
						self.message('Saved!');
					} else {
						var msg = '';
						if(typeof(res.message) != 'undefined')
						{
							msg = res.message;
						}
						self.message(msg);
					}
				},
				error: function(oxmlreq, msg){
				},
				complete: function(){
					$(form).hideAjaxloader();
				}
			});
			
			return false;
		}

		self.message = function(msg)
		{
			$.jGrowl(msg, {header: 'Information:', life: 10000});
		}


		self.init();
	};

	$.fn.rowadd.rows = [
		{
			type			: 'text',
			fieldNameDetect : function(x){return $(x).attr('class');},
			selectOptions	: null		// options for select, can be array of keys OR array of {val:optionValue,html:optionInner}
		}
	];
	
	$.fn.rowadd.defaults = {
		servUrl					: '?',		// server url to send, must return {code:1} or {code:0,message:'user message'}
		servPrimaryIdName		: 'id', 	// default primary key name to send to server

		callbackAdd				: function(data) {return true;}
	};
})(jQuery);
