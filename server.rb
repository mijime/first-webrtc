require 'webrick'

class ApiServlet < WEBrick::HTTPServlet::AbstractServlet
  @@req = nil
  def do_GET(req, res)
    p @@req
    @@req = req
  end

  def do_POST(req, res)
    p req
  end
end

srv = WEBrick::HTTPServer.new :DocumentRoot => '.', :Port => 8000
srv.mount '/api', ApiServlet
srv.start
