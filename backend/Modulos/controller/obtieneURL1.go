package controller

// ObtieneURL1 is...
func ObtieneURL1(pReporte string, pTipo string, pPrompt string, pIDReport string) string {
	//pTipo=pdf/htm/xls
	var sURL string
	var sServidorReport string

	sServidorReport = "http://10.150.11.31:8080/crystalqafar/"
	sURL = sServidorReport + "sisalud2rpt.jsp?report=" + pReporte + "&init=" + pTipo + pPrompt + "&xTime=" + pIDReport

	return sURL
}
