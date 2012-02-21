function notesInit()
{
	var noteShowedTitle = 'Hide';
	var noteHidenTitle = 'Show';
	var noteHandlerSetted = 'End Adding';
	var noteHandlerUnsetted = 'Click\'n\'Add';

	var moduleName = 'notesModule'+notesGetModuleName();
	if (window[moduleName])
	{
		var selector = window[moduleName]();
	}
	else
	{
		return false;
	}
	//create control
	var div = $('<div class="notes-control"/>');
	$('body').append(div);
	div.hide();
	div.css({
		position: 'absolute',
		left    : 0,
		top   : 0,
		'font-size': 10
	});
	var divShow = $('<div/>');
	
	divShow.append('<a href="javascript:void(0);">'+noteHidenTitle+'</a>');
	div.append(divShow);
	divShow.find('a').click(function() {
		var self = $(this);
		if (self.data('loading') == 1)
		{
			return true;
		}
		if ($(this).noteViewToggle(selector, $.extend({}, {
			afterShowCallback: function(success){
				if (success)
				{
					//display editing control
					self.parent().parent().find('div:eq(1)').fadeIn();
					self.text(noteShowedTitle);
				}
				self.hideAjaxloader();
				self.data('loading',0);
			}
		})))
		{
			self.data('loading',1);
			self.showAjaxloader('after', 'bars');
		}
		else
		{
			$(this).text(noteHidenTitle);
			$(this).parent().parent().find('div:eq(1) a').text(noteHandlerUnsetted);
			$(this).parent().parent().find('div:eq(1)').fadeOut();
		}
	});
	var divHandler = $('<div/>');
	div.append(divHandler);
	divHandler.append('<a href="javascript:void(0);">'+noteHandlerUnsetted+'</a>');
	divHandler.find('a').click(function() {
		if ($(this).noteToggle(selector))
		{
			$(this).text(noteHandlerSetted);
			$.jGrowl('Now double click to any table row for create new note', {header: 'Information:', life: 10000});
		}
		else
		{
			$(this).text(noteHandlerUnsetted);
		}
	});
	divHandler.hide();
	div.fadeIn();

	//if defined show notes, then show them :]
	if(getCookie('notesView'))
	{
		divShow.find('a').click();
	}
}

function notesGetModuleName()
{
	match = /^\/([^\/]+)\/([^\/]+)\/?/.exec(location.pathname);
	if (match)
	{
		return match[1].substr(0,1).toUpperCase()+match[1].substr(1)+match[2].substr(0,1).toUpperCase()+match[2].substr(1);
	}
	match = /^\/([^\/]+)\/?/.exec(location.pathname);
	if (match)
	{
		return match[1];
	}
	return false;
}

function notesModulePaymentrequestsBrowse()
{
	$.notesOptions({
		iddetect : function(field, fieldName)
		{
			if (fieldName == "PaymentRequestId")
			{
				return $(field).attr('recid');
			}
			else if (fieldName == "TransactionId")
			{
				return $(field).find('td.ourTrID:eq(0)').text();
			}
			else if (fieldName == "PaymentRequestInfo")
			{
				return $(field).find('td.head').text();
			}
			else if (fieldName == "CallbackQueueId")
			{
				return $(field).find('td.head').text()+$(field).parent().find('td.val:eq(0)').text();
			}
			else if (fieldName == "MailQueueId")
			{
				return $(field).find('td.head').text()+$(field).parent().find('td.val:eq(0)').text();
			}
			else if (fieldName == "FeedQueueId")
			{
				return $(field).find('td.head').text()+$(field).parent().find('td.val:eq(0)').text();
			}
			return false;
		},
		idname : function(field)
		{
			id = $(field).attr('recid');
			if (id) { return 'PaymentRequestId' }

			if ($(field).parent().parent().parent('div.transactions').length) { return 'TransactionId' }
			if ($(field).parent().parent().parent('div.extraPR').length)
			{
				return 'PaymentRequestInfo';
			}
			if ($(field).parent().parent('table.callback-queue').length)
			{
				return 'CallbackQueueId';
			}
			if ($(field).parent().parent('table.mail-queue').length)
			{
				return 'MailQueueId';
			}
			if ($(field).parent().parent('table.feed-queue').length)
			{
				return 'FeedQueueId';
			}
			return false;
		}
	});
	return 'div.paymentRequests > table > tbody > tr[class!="subitems-container"]'+
			   ',div.transactions table tbody tr[class!=head]' +
			   ',div.extraPR table tbody tr'+
			   ',table.callback-queue tbody tr'+
			   ',table.mail-queue tbody tr'+
			   ',table.feed-queue tbody tr';
}

function notesModuleTransactionBrowse()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).attr('recid');
		},
		idname : function(field)
		{
			return 'transactionId';
		}
	});

	return 'div.transactions table tbody tr';
}


function notesModuleProductsBrowse()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).find('td.p-id').text();
		},
		idname : function(field)
		{
			return 'ProductId';
		}
	});

	return 'div.products table tbody tr';
}


function notesModuleProductsEdit()
{
	$.notesOptions({
		iddetect : function(field, fieldName)
		{
			if (fieldName == 'ProductInfo')
			{
				return $(field).attr('id');
			}
			else if (fieldName == 'ProductByProcessorId')
			{
				return $(field).attr('prbyprocid');
			}
			else if (fieldName == 'PriceId')
			{
				return $(field).find('td.price-id').text();
			}
			else if (fieldName == 'BundleId')
			{
				return $(field).find('td.bundle-id').text();
			}
			else if (fieldName == 'ExtendedField')
			{
				id = $(field).find('td.extend-info-name').text();
				if (!id)
				{
					id = $(field).find('td.extend-info-name input').val();
				}
				return id;
			}

			return false;
		},
		idname : function(field)
		{
			if ($(field).parent('dl.zend_form').length)
			{
				return 'ProductInfo';
			}
			else if ($(field).parent().parent('table.ppmap').length)
			{
				return 'ProductByProcessorId';
			}
			else if ($(field).parent().parent('table.pprices').length)
			{
				return 'PriceId';
			}
			else if ($(field).parent().parent('table.pbundles').length)
			{
				return 'BundleId';
			}
			else if ($(field).parent().parent('table.pextend').length)
			{
				return 'ExtendedField';
			}

			return false;
		}
	});

	return 'dl.zend_form dt'+
			',table.ppmap tr[class!=head]'+
			',table.pprices tr[class!=head]'+
			',table.pbundles tr[class!=head]'+
			',table.pextend tr[class!=head]';
}

function notesModuleProcessorsBrowse()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).find('td.p-id').text();
		},
		idname : function(field)
		{
			return 'ProcessorId';
		}
	});

	return 'div.processors table tbody tr';
}


function notesModuleProcessorsEdit()
{
	$.notesOptions({
		iddetect : function(field, fieldName)
		{
			if (fieldName == 'ProcessorInfo')
			{
				return $(field).attr('id');
			}
			else if (fieldName == 'ExtraField')
			{
				id = $(field).find('td.extend-field').text();
				if (!id)
				{
					id = $(field).find('td.extend-field input').val();
				}
				return id;
			}

			return false;
		},
		idname : function(field)
		{
			if ($(field).parent('dl.zend_form').length)
			{
				return 'ProcessorInfo';
			}
			else if ($(field).parent().parent('table.pextra').length)
			{
				return 'ExtraField';
			}

			return false;
		}
	});

	return 'dl.zend_form dt'+
			',table.pextra tr[class!=head]';
}


function notesModuleAntifraudBrowse()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).find('td.primaryKey').text();
		},
		idname : function(field)
		{
			return 'AntifraudId';
		}
	});

	return 'div.antifraud table tbody tr';
}

function notesModuleFeedqueueIndex()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).find('td.fq-id').text();
		},
		idname : function(field)
		{
			return 'FeedQueueId';
		}
	});

	return 'div.feedQueue table tbody tr';
}

function notesModuleUsersBrowse()
{
	$.notesOptions({
		iddetect : function(field)
		{
			return $(field).find('td.user-id').text();
		},
		idname : function(field)
		{
			return 'UserId';
		}
	});

	return 'div.users table tbody tr';
}

function notesModuleUsersEdit()
{
	$.notesOptions({
		iddetect : function(field, fieldName)
		{
			if (fieldName == 'UserInfo')
			{
				return $(field).attr('id');
			}
			//TODO: problem with overflow elements
//			else if (fieldName == 'UserPermission')
//			{
//				return $(field).find('td.role-name div input').attr('name');
//			}

			return false;
		},
		idname : function(field)
		{
			if ($(field).parent('dl.zend_form').length)
			{
				return 'UserInfo';
			}
//			else if ($(field).parent().parent('table.user-permissions-roles').length)
//			{
//				return 'UserPermission';
//			}

			return false;
		}
	});

	return 'dl.zend_form dt';
}


$(document).ready(notesInit);
