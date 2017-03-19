<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/">
    <div>
  <xsl:for-each select="databases/post">
    <p><xsl:value-of select="message" /></p>
    <hl/>
  </xsl:for-each>
    </div>
</xsl:template>

</xsl:stylesheet>
