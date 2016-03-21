require 'webrick'
require 'json'

class ApiServlet < WEBrick::HTTPServlet::AbstractServlet
  @@sdp_lists = {}

  def do_GET(req, res)
    b = @@sdp_lists[req.path]
    res.body = JSON.generate b unless b.nil?
  end

  def do_POST(req, res)
    b = JSON.parse req.body
    @@sdp_lists[req.path] = b
  end
end

srv = WEBrick::HTTPServer.new :DocumentRoot => '.', :Port => 8000
srv.mount '/api', ApiServlet
srv.start
