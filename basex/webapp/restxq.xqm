(:~
 : This module contains some basic examples for RESTXQ annotations
 : @author BaseX Team
 :)
module namespace page = 'http://basex.org/modules/web-page';

declare
	%updating
	%rest:path("/postmessage")
	%rest:POST
	%rest:form-param("message","{$message}")
	%rest:form-param("clientid","{$clientid}")	
	function page:messagepost(
		$message as xs:string,
		$clientid as xs:string
		)
{
		let $entry := <post><message>{$message}</message><client>{$clientid}</client></post>
		let $db := db:open("chat_db")
		return (
			db:output(web:redirect("/showlastdb")),
			insert node $entry as last into $db/databases
	)
};

declare
	%updating 
	%rest:path("/initdb")
	%rest:GET
	function page:initdb()
	{
			let $x := 1
			return (
							db:create("chat_db", 'webapp/static/emptydb.xml'),
							db:output(web:redirect("/createddb"))
							)
};

declare
	%rest:path("/createddb")
	%rest:GET
  %output:method("xhtml")
  %output:omit-xml-declaration("no")
  %output:doctype-public("HTML")
	function page:createddb() as element(html)
	{
	<html><h1>created dbs</h1></html>

};


declare
%rest:path("/showdb")
%rest:GET
function page:showdb()
{
	db:open("chat_db")
};


declare
%rest:path("/showlastdb")
%rest:GET
function page:showlastdb()
{
<databases> {
		let $db := db:open("chat_db")
		for $msg in subsequence($db/databases/post, count($db/databases/post) - 10, 11)
		return $msg
} </databases>
};



declare
	%rest:path("/dbtest")
	%rest:GET
	function page:testdb()
	{
			
};

