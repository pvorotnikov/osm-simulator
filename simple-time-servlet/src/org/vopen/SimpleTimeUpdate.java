package org.vopen;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.DeliveryMode;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Session;
import javax.jms.TextMessage;
import javax.jms.Topic;
import javax.servlet.GenericServlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

public class SimpleTimeUpdate extends GenericServlet
{
    private static final long serialVersionUID = 4509841441206190848L;

    // this is our topic
    private static Topic currentUTCTime;

    // a logger is always useful
    private static Logger log = Logger.getLogger(SimpleTimeUpdate.class.getName());

    // our message producer
    private static MessageProducer producer;

    // our text message
    private static TextMessage message;

    // our session
    private static Session session;

    // we need a connection
    private Connection connection;

    // we need a timer to update the time
    private Timer timer;

    // we need someone to update the time
    private TimeUpdater timeUpdater;

    // resources can be injected from WEB-INF/resources.xml file or from the global tomee.xml
    @Resource
    private ConnectionFactory MyJmsConnectionFactory;

    private final static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public void init(ServletConfig config)
    {
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));

        try
        {

            connection = MyJmsConnectionFactory.createConnection();
            connection.start();

            session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            currentUTCTime = session.createTopic("public.currentUTCTime");
            producer = session.createProducer(currentUTCTime);
            producer.setDeliveryMode(DeliveryMode.NON_PERSISTENT);

            timer = new Timer();
            timeUpdater = new TimeUpdater();
            timer.scheduleAtFixedRate(timeUpdater, 2000, 500);
            
            log.info("SimpleTimeUpdate servlet up and running");

        }

        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public void destroy()
    {
        timer.cancel();
        try
        {
            connection.stop();
        }
        catch (JMSException e)
        {
            e.printStackTrace();
        }
        
        log.info("SimpleTimeUpdate servlet destroyed");
    }

    private class TimeUpdater extends TimerTask
    {

        @Override
        public void run()
        {
            try
            {
                message = session.createTextMessage(GetUTCdatetimeAsString());
                producer.send(message);
            }
            catch (JMSException e)
            {
                e.printStackTrace();
            }

        }

    }

    public static String GetUTCdatetimeAsString()
    {
        final String utcTime = sdf.format(new Date());
        return utcTime;
    }

    public void service(ServletRequest arg0, ServletResponse arg1)
            throws ServletException, IOException
    {
        // intentionally do nothing
    }

}
