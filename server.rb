require 'webrick'

class ApiServlet < WEBrick::HTTPServlet::AbstractServlet
  @@req = ""

  def do_GET(req, res)
    p @@req
    res.body = @@req
  end

  def do_POST(req, res)
    p @@req = req.body
  end
end

srv = WEBrick::HTTPServer.new :DocumentRoot => '.', :Port => 8000
srv.mount '/api', ApiServlet
srv.start
